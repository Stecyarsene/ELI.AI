import Link from 'next/link';

/** HUB : aiguillage hermétique vers les deux programmes (parité maquette hub_accueil.html). */
export default function Hub() {
  return (
    <nav aria-label="Choix du programme" style={{ display: 'grid', gap: 16, padding: 24, maxWidth: 760, margin: '0 auto' }}>
      <h1>Éli — Choisis ton programme</h1>
      <Link className="tile" href="/national/dashboard">🌍 Programme National (Gabon) — CP1 → Terminale</Link>
      <Link className="tile" href="/aefe/dashboard">🇫🇷 Programme AEFE — 6e → Terminale</Link>
    </nav>
  );
}
