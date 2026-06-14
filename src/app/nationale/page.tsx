import RememberProgram from '@/components/RememberProgram';

/** Programme National (Gabon) — maquette « Sanctuaire Vivant » servie en plein écran. */
export default function Nationale() {
  return (
    <>
      <iframe
        src="/maquettes/nationale.html"
        title="Éli — Programme National"
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', border: 'none' }}
      />
      <RememberProgram program="national" />
    </>
  );
}
