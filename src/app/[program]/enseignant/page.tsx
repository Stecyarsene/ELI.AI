/** Espace ENSEIGNANT — maquette premium servie en plein écran (auth WhatsApp + dashboard).
 *  Bi-programme : on transmet le programme à la maquette via la query. */
export default function TeacherSpace({ params }: { params: { program: string } }) {
  const program = params.program === 'aefe' ? 'aefe' : 'national';
  return (
    <iframe
      src={`/maquettes/enseignant.html?program=${program}`}
      title="Éli — Espace Enseignant"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', border: 'none' }}
    />
  );
}
