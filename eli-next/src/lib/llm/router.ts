/**
 * ÉLI — Routeur LLM résilient (doc 9, pilier 1). Failover invisible : si le primaire
 * échoue (500 / timeout / 429), bascule instantanée sur le secours. Code pur & testable.
 */
export interface LLMProvider { name: string; call(prompt: string, system: string): Promise<string>; }

export class LLMRouter {
  constructor(private providers: LLMProvider[], private timeoutMs = 8000) {
    if (providers.length === 0) throw new Error('au moins un provider requis');
  }
  async generate(prompt: string, system: string): Promise<{ text: string; provider: string; failovers: number }> {
    let failovers = 0; let lastErr: unknown;
    for (const p of this.providers) {
      try {
        const text = await this.withTimeout(p.call(prompt, system));
        return { text, provider: p.name, failovers };
      } catch (e) { lastErr = e; failovers++; /* on tente le suivant */ }
    }
    throw new Error(`Tous les LLM ont échoué (${failovers} tentatives): ${String(lastErr)}`);
  }
  private withTimeout<T>(promise: Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('timeout')), this.timeoutMs);
      if (typeof (t as { unref?: () => void }).unref === 'function') (t as { unref: () => void }).unref();
      promise.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
    });
  }
}
