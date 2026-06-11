import { splitVoice } from '../../src/lib/llm/voiceSplit';

describe('Voix-d\'abord — séparation parole / écrit', () => {
  it('extrait [VOIX] et garde le reste comme écrit', () => {
    const r = splitVoice('[VOIX]Salut ! On attaque les fractions ?[/VOIX]\n\nUne fraction, c\'est une part d\'un tout...');
    expect(r.speech).toBe('Salut ! On attaque les fractions ?');
    expect(r.written).toContain('part d\'un tout');
    expect(r.written).not.toContain('[VOIX]');
  });
  it('sans balise : prend la 1ère phrase comme voix (dégradation propre)', () => {
    const r = splitVoice('Bonjour Marie. Voici le détail du cours.');
    expect(r.speech).toBe('Bonjour Marie.');
    expect(r.written).toContain('détail du cours');
  });
  it('voix seule sans écrit : written reprend la voix', () => {
    const r = splitVoice('[VOIX]Bravo, tu as tout bon ![/VOIX]');
    expect(r.speech).toBe('Bravo, tu as tout bon !');
    expect(r.written).toBe('Bravo, tu as tout bon !');
  });
});
