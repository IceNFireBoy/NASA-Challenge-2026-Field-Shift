// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
const SECTIONS = [
  ['evidence', 'Evidence'],
  ['benefits', 'Benefits'],
  ['gaps', 'Information gaps'],
  ['risks', 'Risks needing local review'],
  ['validate', 'Check locally'],
];

export default function WhyCard({ card }) {
  return (
    <div className="mt-3 space-y-3 text-sm text-stone-800">
      <section>
        <h4 className="font-semibold">Why it ranks here</h4>
        <p>{card.why}</p>
      </section>
      {SECTIONS.map(([key, title]) => card[key].length > 0 && (
        <section key={key}>
          <h4 className="font-semibold">{title}</h4>
          <ul className="list-disc space-y-1 pl-5">{card[key].map((t) => <li key={t}>{t}</li>)}</ul>
        </section>
      ))}
      {card.pest && (
        <section>
          <h4 className="font-semibold">Pest cycle</h4>
          <p>{card.pest}</p>
        </section>
      )}
    </div>
  );
}
