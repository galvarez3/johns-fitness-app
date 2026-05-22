// Claude API integration for dynamic workout block generation
// Uses the Anthropic Messages API directly via fetch

const CLAUDE_API = 'https://api.anthropic.com/v1/messages';

export async function generateBlockWithClaude(apiKey, blockNum, previousBlockSummary) {
  if (!apiKey) return { ok: false, error: 'No API key configured' };

  const prompt = `You are a strength and conditioning coach generating a 4-week Upper/Lower training block for an intermediate lifter named John.

John's profile:
- Height: 5'11", Weight: ~167 lbs, Goal: 175 lbs
- Goal: Muscle mass gain + progressive strength
- Training days: Monday (Upper A), Tuesday (Lower A), Thursday (Upper B), Friday (Lower B)
- Block number: ${blockNum}

${previousBlockSummary ? `Previous block summary:\n${previousBlockSummary}\n` : ''}

Generate coaching notes and exercise cues for each of the 4 workout types across the 4-week block. Focus on:
1. Weekly theme (hypertrophy/strength/volume/hypertrophy+)
2. 2-3 key technique cues per main lift
3. Any programming notes or progressions

Respond in JSON format:
{
  "blockNotes": "Overall block intent in 1-2 sentences",
  "weeklyThemes": [
    { "week": 1, "theme": "Hypertrophy", "notes": "..." },
    ...
  ],
  "exerciseCues": {
    "Bench Press": ["cue 1", "cue 2"],
    "Back Squat": ["cue 1", "cue 2"],
    "Deadlift": ["cue 1", "cue 2"],
    "Standing OHP": ["cue 1", "cue 2"]
  }
}`;

  try {
    const res = await fetch(CLAUDE_API, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      return { ok: false, error: err.error?.message || 'Claude API error' };
    }

    const data = await res.json();
    const text = data.content[0]?.text || '';

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return { ok: true, data: JSON.parse(jsonMatch[0]) };
    }

    return { ok: false, error: 'Could not parse Claude response' };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
