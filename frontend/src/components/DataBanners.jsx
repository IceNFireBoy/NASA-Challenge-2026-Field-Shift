// SI-ASSISTED: generated with Claude Code (Anthropic); reviewed by the team.
export default function DataBanners({ meta, rainSource, scenarioId }) {
  const imerg = (meta.sources || []).find((s) => /imerg/i.test(s.id || s.name || ''));
  return (
    <div className="space-y-2">
      {meta.data_status === 'placeholder' && (
        <p role="alert" className="callout text-base font-bold">Placeholder data: these are not real NASA observations.</p>
      )}
      {rainSource !== 'imerg' && meta.data_status !== 'placeholder' && (
        <p className="callout text-sm">
          GPM IMERG satellite rainfall was not used; rainfall comes from NASA POWER (a gridded estimate, not a weather station).
          {imerg && <> IMERG status: {imerg.status}.</>}
        </p>
      )}
      {scenarioId !== 'typical' && (
        <p className="callout text-sm">
          PAGASA (5 Nov 2026): a very strong El Niño is under way, with impacts likely into mid-2027. Source listed in the Data tab.
        </p>
      )}
    </div>
  );
}
