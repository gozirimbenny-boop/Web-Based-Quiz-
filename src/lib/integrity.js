// Activity integrity signals for teacher-set assignments and live rooms.
// Records how often a student leaves the page (switches tab/app), how long
// they're away, and copy/paste events. These are *signals*, not proof —
// a student can leave for innocent reasons — so the teacher view says so.

export function createTracker() {
  let awayStart = null;
  let awayMs = 0;
  let leaves = 0;
  let copies = 0;
  let pastes = 0;

  const leave = () => {
    if (awayStart === null) {
      awayStart = Date.now();
      leaves += 1;
    }
  };
  const back = () => {
    if (awayStart !== null) {
      awayMs += Date.now() - awayStart;
      awayStart = null;
    }
  };
  const onVisibility = () => (document.hidden ? leave() : back());
  const onCopy = () => (copies += 1);
  const onPaste = () => (pastes += 1);

  window.addEventListener('blur', leave);
  window.addEventListener('focus', back);
  document.addEventListener('visibilitychange', onVisibility);
  document.addEventListener('copy', onCopy);
  document.addEventListener('paste', onPaste);

  return {
    snapshot: () => ({ awayMs: awayMs + (awayStart !== null ? Date.now() - awayStart : 0), leaves, copies, pastes }),
    stop() {
      back();
      window.removeEventListener('blur', leave);
      window.removeEventListener('focus', back);
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('copy', onCopy);
      document.removeEventListener('paste', onPaste);
    },
  };
}

// Turns a submission into readable warning signs for the teacher.
// Returns { level: 'none'|'low'|'medium'|'high', notes: [string] }.
export function analyze(sub) {
  if (!sub) return { level: 'none', notes: [] };
  const notes = [];
  let score = 0;
  const answers = sub.answers || [];
  const secs = (ms) => Math.round(ms / 1000);

  if (sub.attempts > 1) {
    notes.push(`Restarted the activity ${sub.attempts - 1} time${sub.attempts === 2 ? '' : 's'} (saw questions before the counted attempt)`);
    score += 1;
  }
  if (sub.leaves > 0) {
    notes.push(`Left the page ${sub.leaves} time${sub.leaves === 1 ? '' : 's'} (${secs(sub.awayMs || 0)}s away)`);
    score += sub.leaves >= 3 ? 2 : 1;
  }
  if (sub.copies > 0) {
    notes.push(`Copied text ${sub.copies} time${sub.copies === 1 ? '' : 's'}`);
    score += 2;
  }
  if (sub.pastes > 0) {
    notes.push(`Pasted text ${sub.pastes} time${sub.pastes === 1 ? '' : 's'}`);
    score += 2;
  }
  const lookups = answers.filter((a) => a.correct && (a.away || 0) > 3000).length;
  if (lookups) {
    notes.push(`${lookups} correct answer${lookups === 1 ? '' : 's'} right after leaving the page`);
    score += lookups >= 2 ? 3 : 2;
  }
  const fast = answers.filter((a) => a.kind === 'choice' && a.ms < 1200).length;
  if (fast >= 3) {
    notes.push(`${fast} answers in under 1.2 seconds (guessing?)`);
    score += 1;
  }
  const slowCorrect = answers.filter((a) => a.correct && a.ms > 45000).length;
  if (slowCorrect >= 2) {
    notes.push(`${slowCorrect} correct answers that took over 45 seconds`);
    score += 1;
  }
  const level = score === 0 ? 'none' : score <= 1 ? 'low' : score <= 3 ? 'medium' : 'high';
  return { level, notes };
}
