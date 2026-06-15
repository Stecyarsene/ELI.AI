/** Espace PARENT — maquette premium servie en plein écran (auth WhatsApp + suivi de l'enfant).
 *  Bi-programme : on transmet le programme à la maquette via la query. */
export default function ParentSpace({ params }: { params: { program: string } }) {
  const program = params.program === 'aefe' ? 'aefe' : 'national';
  return (
    <iframe
      src={`/maquettes/parent.html?program=${program}`}
      title="Éli — Espace Parents"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', border: 'none' }}
    />
  );
}
