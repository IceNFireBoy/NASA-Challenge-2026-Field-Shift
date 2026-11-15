#!/usr/bin/env python3
# SI-ASSISTED: drafted by Claude (Anthropic, claude.ai); reviewed by the team.
"""Write every bundled file out of the build kit.

A bundled file is a line `<!-- FILE: relative/path -->` followed by a fence of four
backticks (optionally with a language), the file body, and a closing line of four backticks.

  python tools/extract_bundle.py FIELD_SHIFT_BUILD_KIT.md            # write missing files
  python tools/extract_bundle.py FIELD_SHIFT_BUILD_KIT.md --force    # overwrite existing files
  python tools/extract_bundle.py FIELD_SHIFT_BUILD_KIT.md --list     # show what would be written
"""
import argparse
import re
import sys
from pathlib import Path

MARK = re.compile(r"^<!-- FILE: (?P<path>[^>]+?) -->\s*$")
FENCE_OPEN = re.compile(r"^````[A-Za-z0-9_+-]*\s*$")
FENCE_CLOSE = "````"


def parse(text):
    lines = text.splitlines()
    files, i = [], 0
    while i < len(lines):
        m = MARK.match(lines[i])
        if not m:
            i += 1
            continue
        path = m.group("path").strip()
        if i + 1 >= len(lines) or not FENCE_OPEN.match(lines[i + 1]):
            sys.exit(f"Marker for {path} (line {i + 1}) is not followed by a ```` fence")
        j = i + 2
        while j < len(lines) and lines[j].rstrip() != FENCE_CLOSE:
            j += 1
        if j >= len(lines):
            sys.exit(f"Unclosed fence for {path}")
        files.append((path, "\n".join(lines[i + 2:j]) + "\n"))
        i = j + 1
    return files


def safe(root, rel):
    p = Path(rel)
    if p.is_absolute() or ".." in p.parts or (p.parts and p.parts[0] == ".claude"):
        sys.exit(f"Refusing unsafe path: {rel}")
    return root / p


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("kit")
    ap.add_argument("--root", default=".")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--list", action="store_true")
    a = ap.parse_args()
    root = Path(a.root).resolve()
    files = parse(Path(a.kit).read_text(encoding="utf-8"))
    if not files:
        sys.exit("No bundled files found")
    written = skipped = 0
    for rel, body in files:
        dest = safe(root, rel)
        if a.list:
            print(f"{len(body):>7} bytes  {rel}")
            continue
        if dest.exists() and not a.force:
            print(f"skip (exists)  {rel}")
            skipped += 1
            continue
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(body, encoding="utf-8", newline="\n")
        print(f"wrote          {rel}")
        written += 1
    if not a.list:
        print(f"\n{written} written, {skipped} skipped, {len(files)} in kit")


if __name__ == "__main__":
    main()
