// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
export default function DataBanners({ meta, rainSource, scenarioId }) {
  const imerg = (meta.sources || []).find((s) => /imerg/i.test(s.id || s.name || ''));
  return (
    <div className="space-y-2">
      {meta.data_status === 'placeholder' && (
        <p role="alert" className="rounded border border-red-400 bg-red-100 p-3 text-sm font-semibold text-red-950">Placeholder data: these are not real NASA observations.</p>
      )}
      {rainSource !== 'imerg' && meta.data_status !== 'placeholder' && (
        <p className="rounded border border-sky-300 bg-sky-50 p-3 text-sm text-sky-950">
          GPM IMERG satellite rainfall was not used; rainfall comes from NASA POWER (a gridded estimate, not a weather station).
          {imerg && <> IMERG status: {imerg.status}.</>}
        </p>
      )}
      {scenarioId !== 'typical' && (
        <p className="rounded border border-stone-300 bg-white p-3 text-sm">
          PAGASA (5 Nov 2026): a very strong El Niño is under way, with impacts likely into mid-2027. Source listed in the Data tab.
        </p>
      )}
    </div>
  );
}
