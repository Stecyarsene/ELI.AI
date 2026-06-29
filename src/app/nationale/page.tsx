import { redirect } from 'next/navigation';

/** Programme National — on dirige vers le nouvel espace élève (dashboard React + chat Éli).
 *  L'ancienne maquette « Sanctuaire » (nationale.html) est retirée. AEFE est supprimé. */
export default function Nationale() {
  redirect('/national/dashboard');
}
