// Read-aloud (speech synthesis) and spoken answers (speech recognition).
// Speech recognition works in Chrome, Edge and Safari; other browsers fall
// back to tapping.

const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;
export const canListen = !!SR;

export function speak(text, { rate = 1 } = {}) {
  if (!canSpeak) return Promise.resolve();
  window.speechSynthesis.cancel();
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate;
    u.lang = 'en-US';
    u.onend = resolve;
    u.onerror = resolve;
    window.speechSynthesis.speak(u);
  });
}

export const stopSpeaking = () => canSpeak && window.speechSynthesis.cancel();

// Resolves with a list of possible transcripts (lower case), or [] on failure.
export function listen({ timeout = 8000 } = {}) {
  if (!SR) return Promise.resolve([]);
  return new Promise((resolve) => {
    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 5;
    let done = false;
    const finish = (val) => {
      if (done) return;
      done = true;
      try {
        rec.stop();
      } catch {
        /* already stopped */
      }
      resolve(val);
    };
    rec.onresult = (e) => finish(Array.from(e.results[0]).map((r) => r.transcript.toLowerCase().trim()));
    rec.onerror = () => finish([]);
    rec.onend = () => finish([]);
    setTimeout(() => finish([]), timeout);
    rec.start();
  });
}

const LETTERS = ['a', 'b', 'c', 'd'];
const LETTER_WORDS = { a: ['a', 'ay', 'hey', 'eh', 'letter a', 'option a'], b: ['b', 'be', 'bee', 'letter b', 'option b'], c: ['c', 'see', 'sea', 'letter c', 'option c'], d: ['d', 'dee', 'letter d', 'option d'] };

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

// Match what the player said to one of the choices. Returns index or -1.
export function matchSpoken(transcripts, choices) {
  for (const raw of transcripts) {
    const said = norm(raw);
    // "true"/"false" etc. or the full answer text
    for (let i = 0; i < choices.length; i++) {
      const c = norm(choices[i]);
      if (said === c || said.includes(c) || (c.length > 4 && c.includes(said) && said.length > 3)) return i;
    }
    // "A", "option B", "answer C"
    const cleaned = said.replace(/^(answer|option|letter|it s|its|is)\s+/, '');
    for (let i = 0; i < Math.min(choices.length, 4); i++) {
      if (LETTER_WORDS[LETTERS[i]].includes(cleaned)) return i;
    }
    // Partial word overlap (e.g. "mitochondria" for "Mitochondrion")
    for (let i = 0; i < choices.length; i++) {
      const c = norm(choices[i]);
      if (c.length >= 5 && said.length >= 5 && (c.startsWith(said.slice(0, 6)) || said.startsWith(c.slice(0, 6)))) return i;
    }
  }
  return -1;
}
