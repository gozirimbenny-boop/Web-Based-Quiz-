// "Install the app" card and the notifications switch.
import { useState } from 'react';
import OrganelleIcon from '../art/OrganelleIcon.jsx';
import { useProgress } from '../game/progress.jsx';
import { askNotifyPermission, notifyPermission, notifySupported, registerStreakReminder, systemNotify, useInstall } from '../lib/pwa.js';

export function InstallCard({ compact = false }) {
  const { canPrompt, installed, ios, install } = useInstall();
  const [showIos, setShowIos] = useState(false);
  if (installed || (!canPrompt && !ios)) return null;
  return (
    <div className={`card install-card ${compact ? 'compact' : ''}`}>
      <img src="pwa-192.png" alt="" width="56" height="56" className="install-icon" />
      <div className="grow">
        <strong>Install Cell Quest</strong>
        <span className="muted small">Play from your home screen, full-screen, even offline.</span>
        {showIos && (
          <ol className="ios-steps small">
            <li>
              Tap the <strong>Share</strong> button (square with an arrow) in Safari.
            </li>
            <li>
              Choose <strong>Add to Home Screen</strong>, then <strong>Add</strong>.
            </li>
          </ol>
        )}
      </div>
      {canPrompt ? (
        <button className="btn coral small" onClick={install}>
          Install
        </button>
      ) : (
        <button className="btn coral small" onClick={() => setShowIos((s) => !s)}>
          {showIos ? 'Got it' : 'How?'}
        </button>
      )}
    </div>
  );
}

export function NotificationSetting() {
  const p = useProgress();
  const [perm, setPerm] = useState(notifyPermission());
  const [msg, setMsg] = useState('');

  if (!notifySupported()) {
    return (
      <p className="muted small">
        This browser can’t show notifications. On iPhone/iPad, install the app to your home screen first (iOS 16.4 or newer), then open it from there.
      </p>
    );
  }

  const toggle = async (on) => {
    setMsg('');
    if (!on) {
      p.update({ notify: false });
      return;
    }
    const result = perm === 'granted' ? 'granted' : await askNotifyPermission();
    setPerm(result);
    if (result === 'granted') {
      p.update({ notify: true });
      registerStreakReminder();
      systemNotify('Notifications are on! 🎉', { body: 'We’ll tell you about friend requests, duels and your daily streak.', tag: 'welcome' });
    } else {
      setMsg('Notifications are blocked for this site. Allow them in your browser’s site settings (the icon left of the address bar), then try again.');
    }
  };

  return (
    <div className="notify-setting">
      <label className="toggle">
        <input type="checkbox" checked={p.notify && perm === 'granted'} onChange={(e) => toggle(e.target.checked)} /> Notifications
      </label>
      <p className="muted small">
        <OrganelleIcon id="vesicle" size={18} /> Friend requests, duel challenges and results, and an evening reminder to keep your streak. Alerts arrive while Cell Quest is open
        (including in the background); installed apps on Android/Chrome can also get the daily streak reminder when closed.
      </p>
      {msg && <p className="error-msg small">{msg}</p>}
    </div>
  );
}
