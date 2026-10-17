// /play/:modeId — builds a round and runs it.
// Query params for friend duels:
//   ?to=<uid>&toName=<name>    play a round, then send it as a challenge
//   ?challenge=<id>&seed=<s>   answer a friend's challenge (same questions)
import { useCallback, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import QuizRunner from '../components/QuizRunner.jsx';
import { MODE_BY_ID, buildRound } from '../game/modes.js';
import { randomSeed } from '../game/rng.js';
import { useProgress } from '../game/progress.jsx';
import { useSocial } from '../lib/social.jsx';

// Remount when the URL changes so going from one game to another starts fresh.
export default function PlayRoute() {
  const { pathname, search } = useLocation();
  return <Play key={pathname + search} />;
}

function Play() {
  const { modeId } = useParams();
  const [params] = useSearchParams();
  const mode = MODE_BY_ID[modeId];
  const p = useProgress();
  const social = useSocial();

  const challengeId = params.get('challenge');
  const to = params.get('to');
  const toName = params.get('toName');

  const makeSeed = () => params.get('seed') || mode?.seed?.() || randomSeed();
  const [run, setRun] = useState(() => {
    if (!mode) return null;
    const seed = makeSeed();
    return { key: 0, seed, questions: buildRound(modeId, seed, { mistakes: p.mistakes }) };
  });
  const [duelMsg, setDuelMsg] = useState(null);
  const sentRef = useRef(false);

  const replay = useCallback(() => {
    // Daily and challenge rounds replay the same questions; others get new ones.
    const seed = challengeId || mode.seed ? run.seed : randomSeed();
    setDuelMsg(null);
    setRun((r) => ({ key: r.key + 1, seed, questions: buildRound(modeId, seed, { mistakes: p.mistakes }) }));
  }, [challengeId, mode, modeId, p.mistakes, run]);

  const onFinish = useCallback(
    async ({ score, max }) => {
      if (!social.user) return;
      if (challengeId) {
        const ch = social.challenges.incoming.find((c) => c.id === challengeId);
        if (ch && ch.status === 'open') {
          await social.completeChallenge(challengeId, score, max);
          const verdict = score > ch.fromScore ? 'You win! 🏆' : score === ch.fromScore ? 'It’s a draw!' : `${ch.fromName} wins this one.`;
          setDuelMsg(`You scored ${score}/${max}. ${ch.fromName} scored ${ch.fromScore}/${ch.fromMax}. ${verdict}`);
        }
      } else if (to && !sentRef.current) {
        sentRef.current = true;
        const ok = await social.sendChallenge({ to, toName, seed: run.seed, score, max });
        if (ok) setDuelMsg(`Challenge sent to ${toName}! They’ll play the same questions and try to beat ${score}/${max}.`);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [challengeId, to, toName, run?.seed, social.user, social.challenges.incoming],
  );

  if (!mode) return <Navigate to="/play" replace />;

  return (
    <QuizRunner
      key={run.key}
      mode={mode}
      questions={run.questions}
      onFinish={onFinish}
      onReplay={replay}
      extraResults={
        (duelMsg || social.error) && (
          <div className={`card duel-result ${social.error ? 'error' : ''}`}>
            <p>{social.error || duelMsg}</p>
            <Link to="/friends" className="btn ghost small">
              Back to friends
            </Link>
          </div>
        )
      }
    />
  );
}
