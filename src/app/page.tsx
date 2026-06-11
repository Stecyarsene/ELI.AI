/** Accueil Éli — Hub d'aiguillage (maquette hub_accueil servie en plein écran). */
export default function Home() {
  return (
    <iframe
      src="/maquettes/hub.html"
      title="Éli — Accueil"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', border: 'none' }}
    />
  );
}
