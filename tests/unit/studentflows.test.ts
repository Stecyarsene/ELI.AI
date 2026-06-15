import { paperMatchesSerie, filterPapersForSerie, parseSeries, subjectsOf, TERMINALE_SERIES } from '../../src/lib/exam';
import { detectClassKey, detectSerie, looksLost, onboardingIntent } from '../../src/lib/onboarding';
import { workedSubjects, hasWorkedSubjects } from '../../src/lib/student/subjects';

describe('T7 — Filtrage des épreuves par série', () => {
  const papers = [
    { serie: 'A1,B', subject: 'Mathématiques', title: 'BAC Maths A1B' },
    { serie: 'C,D', subject: 'SVT / Physique', title: 'BAC SVT' },
    { serie: 'ALL', subject: 'Mathématiques', title: 'Tronc commun' },
    { serie: 'D', subject: 'Physique-Chimie', title: 'BAC PC D' },
    { serie: 'C,D,S', subject: 'Français', title: 'BAC Français' },
  ];
  it('parseSeries normalise et découpe', () => {
    expect(parseSeries('a1, b')).toEqual(['A1', 'B']);
    expect(parseSeries('C/D')).toEqual(['C', 'D']);
    expect(parseSeries(null)).toEqual([]);
  });
  it('ALL concerne toutes les séries', () => {
    expect(paperMatchesSerie('ALL', 'A2')).toBe(true);
    expect(paperMatchesSerie('ALL', 'C')).toBe(true);
  });
  it('match série multiple', () => {
    expect(paperMatchesSerie('A1,B', 'B')).toBe(true);
    expect(paperMatchesSerie('A1,B', 'C')).toBe(false);
    expect(paperMatchesSerie('C,D', 'D')).toBe(true);
  });
  it('série vide → aucun match', () => {
    expect(paperMatchesSerie('C', '')).toBe(false);
  });
  it('filterPapersForSerie(D) renvoie D + C,D + C,D,S + ALL', () => {
    const r = filterPapersForSerie(papers, 'D');
    expect(r.map((p) => p.title).sort()).toEqual(['BAC Français', 'BAC PC D', 'BAC SVT', 'Tronc commun']);
  });
  it('filterPapersForSerie(B) renvoie A1,B + ALL', () => {
    const r = filterPapersForSerie(papers, 'B');
    expect(r).toHaveLength(2);
  });
  it('subjectsOf dédoublonne et trie', () => {
    expect(subjectsOf(papers)).toEqual(['Français', 'Mathématiques', 'Physique-Chimie', 'SVT / Physique']);
  });
  it('Terminale a 6 séries', () => {
    expect(TERMINALE_SERIES).toHaveLength(6);
  });
});

describe('T8 — Onboarding par le chat', () => {
  it('détecte la classe', () => {
    expect(detectClassKey('je suis en terminale')).toBe('terminale');
    expect(detectClassKey('Salut, je suis en 3ème')).toBe('3e');
    expect(detectClassKey('moi cm2')).toBe('cm2');
    expect(detectClassKey('bonjour')).toBeNull();
  });
  it('détecte la série', () => {
    expect(detectSerie('terminale D')).toBe('D');
    expect(detectSerie('je suis en série C')).toBe('C');
    expect(detectSerie('A1 stp')).toBe('A1');
    expect(detectSerie('rien ici')).toBeNull();
  });
  it('repère un élève égaré', () => {
    expect(looksLost('bonjour')).toBe(true);
    expect(looksLost('je sais pas quoi faire')).toBe(true);
    expect(looksLost('aide moi')).toBe(true);
    expect(looksLost('Explique-moi le théorème de Pythagore en détail')).toBe(false);
  });
  it('aiguillage : classe nommée → navigate_class', () => {
    expect(onboardingIntent('je suis en terminale C', false)).toMatchObject({ intent: 'navigate_class', classKey: 'terminale', serie: 'C' });
  });
  it('aiguillage : 1er contact sans classe → guide', () => {
    expect(onboardingIntent('bonjour', true).intent).toBe('guide');
  });
  it('aiguillage : question claire → normal (ne pas interrompre)', () => {
    expect(onboardingIntent('Comment résoudre une équation du second degré ?', false).intent).toBe('normal');
  });
});

describe('T6 — Matières travaillées', () => {
  const progress = [
    { subject: 'Mathématiques', status: 'vert', last_chapter: 'Suites', updated_at: '2026-06-10T10:00:00Z' },
    { subject: 'Physique-Chimie', status: 'rouge', last_chapter: 'Ondes', updated_at: '2026-06-12T10:00:00Z' },
    { subject: 'Mathématiques', status: 'orange', last_chapter: 'Intégrales', updated_at: '2026-06-13T10:00:00Z' },
    { subject: '', status: 'vert', last_chapter: null, updated_at: '2026-06-14T10:00:00Z' },
  ];
  it('une entrée par matière, la plus récente, triée par récence', () => {
    const r = workedSubjects(progress);
    expect(r.map((s) => s.subject)).toEqual(['Mathématiques', 'Physique-Chimie']);
    expect(r.find((s) => s.subject === 'Mathématiques')?.lastChapter).toBe('Intégrales');
  });
  it('ignore les matières vides', () => {
    expect(workedSubjects(progress).some((s) => s.subject === '')).toBe(false);
  });
  it('statut inconnu → neutre', () => {
    expect(workedSubjects([{ subject: 'Anglais', status: 'xyz', updated_at: '2026-01-01' }])[0].status).toBe('neutre');
  });
  it('hasWorkedSubjects', () => {
    expect(hasWorkedSubjects(progress)).toBe(true);
    expect(hasWorkedSubjects([])).toBe(false);
  });
});
