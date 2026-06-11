export const runtime = 'nodejs';

/** Voix officielle d'Éli via ElevenLabs. Reçoit un texte court (la réplique [VOIX]),
 *  renvoie un flux audio mp3. Si la clé/voix manque ou ElevenLabs échoue → 503,
 *  et le client bascule automatiquement sur la voix navigateur (jamais de blanc). */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { text?: string } | null;
  const text = (body?.text || '').slice(0, 600).trim();
  if (!text) return Response.json({ error: 'no_text' }, { status: 400 });

  const key = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  if (!key || !voiceId) return Response.json({ error: 'tts_not_configured' }, { status: 503 });

  try {
    const r = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?optimize_streaming_latency=3&output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: { 'xi-api-key': key, 'content-type': 'application/json', accept: 'audio/mpeg' },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.2, use_speaker_boost: true },
        }),
      }
    );
    if (!r.ok || !r.body) return Response.json({ error: 'tts_unavailable' }, { status: 503 });
    return new Response(r.body, { headers: { 'content-type': 'audio/mpeg', 'cache-control': 'no-store' } });
  } catch {
    return Response.json({ error: 'tts_error' }, { status: 503 });
  }
}
