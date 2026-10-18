# Cell Quest 🧫

A fun, game-style website for learning **cells and organelles**: quizzes, puzzles, diagrams, a timed challenge, voice mode, streaks, badges and friend duels.

Built with React + Vite. Hosted free on GitHub Pages. Online features (friends, challenges, leaderboard) use Firebase and are optional.

## Game modes

| Mode | What you do |
| --- | --- |
| Daily Cell Challenge | 10 mixed questions, the same for everyone that day. +30 bonus XP. |
| 10-Minute Quick Quiz | Answer as many mixed questions as you can before the clock runs out. |
| Cell Sprint | 15 multiple-choice questions, 20 seconds each. |
| True or False | 15 fast statements, 12 seconds each. |
| Scramble Lab | Read the meaning, function and type, then unscramble the word. |
| Organelle Detective | Riddles. Using the hint halves the points. |
| Label the Diagram | Tap the right part of an animal/plant cell, or name the glowing part. |
| Match the Function | Connect each structure to its job. |
| Build-a-Cell | Add the right parts to a plant or animal cell, and avoid the wrong ones. |
| Plant, Animal or Both? | Sort features into the right cell type. |
| Fill the Gap | Pick the missing word. |
| Odd One Out | Spot the one that doesn't belong. |
| Two-Part Challenge | Write answers to part A and B, compare with the model answer, mark yourself. |
| Voice Lab | Questions are read aloud and you answer by speaking (Chrome / Edge / Safari). |
| Fix My Mistakes | Replays questions you got wrong. |
| Friend Duel | Challenge a friend to the same 12 questions. |

Plus: **Cell Explorer** (tap any part of a cell to learn about it), a Cell Library, XP and ranks (Cell Rookie → Master Biologist), daily streaks, 12 badges, and a "Learn from mistakes" page.

Animations include a 3-2-1-GO countdown, "Great job!" / "Not quite!" pop-ups, combo flames, "Streak lost!", level-up, badge unlocks, confetti and a "Try again" screen. All sounds are generated in the browser (no audio files), and can be muted.

## Install it like an app

Cell Quest is an installable web app (PWA):

- **Android / Chrome / Edge:** open the site and tap **Install** (on the home page or in **Me → Settings**), or use the browser menu → *Install app*.
- **iPhone / iPad:** open the site in Safari → **Share** → **Add to Home Screen**.

Once installed it opens full-screen, works offline (online features excepted), has its own icon with shortcuts (Daily Challenge, Quick Quiz, Friends), and shows an **Update** banner when a new version is published, so a game is never interrupted.

## Notifications

Turn them on in **Me → Settings → Notifications**. Players get alerts for new friend requests, duel challenges and duel results, plus an evening reminder to keep their daily streak. The installed app icon shows a number badge for pending requests.

Alerts arrive while Cell Quest is open (including in a background tab or minimised). On Android/Chrome, the installed app can also show the daily streak reminder when closed. Alerts that arrive while the app is fully closed would need Firebase's paid Blaze plan plus a server function, which isn't set up.

## Teacher classes

Under **Classes** (or **Friends → Classes** on phones):

- **Teachers** create a class and get a 6-character join code. The live dashboard shows each student's XP, rank, rounds, accuracy, streaks and last activity, plus the class's **most-missed questions**. It can be downloaded as a spreadsheet (CSV).
- **Students** enter the code to join. They are told that the teacher will see their name, progress and missed questions.

## Editing questions (no coding needed)

- **All questions:** [`src/data/questions.js`](src/data/questions.js)
- **Organelle names, meanings, functions, fun facts:** [`src/data/organelles.js`](src/data/organelles.js)

Change the text freely, but keep each question's `id` the same, because ids are used to track mistakes. Questions from the original PDF question bank are marked `// PDF`.

> Teacher note: review the questions against your course notes before publishing.

## Run it on your computer

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install
npm run dev
```

Then open the link it prints (usually http://localhost:5173).

## Publish on GitHub Pages

1. Push to the `main` branch.
2. In the GitHub repo go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. The workflow in `.github/workflows/deploy.yml` builds and publishes the site on every push. The address will be `https://<username>.github.io/<repo-name>/`.

## Online features (Firebase)

Online features are already connected to the Firebase project **cell-quest-0**; its web config is in `src/lib/firebase.js`. **Whenever `firestore.rules` changes, paste the new version into Firebase → Firestore Database → Rules and click Publish.**

To use a different Firebase project instead:

1. Go to [console.firebase.google.com](https://console.firebase.google.com), create a project, then **Add app → Web**. Copy the config values it shows.
2. **Authentication → Sign-in method:** enable **Google** and **Anonymous**.
3. **Authentication → Settings → Authorized domains:** add `<username>.github.io`.
4. **Firestore Database:** create a database (production mode). Open the **Rules** tab, paste in the contents of [`firestore.rules`](firestore.rules), and publish.
5. In the GitHub repo, go to **Settings → Secrets and variables → Actions → Variables** and add:
   `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`
6. Re-run the deploy workflow (Actions tab → Deploy → Run workflow).

For local testing, copy `.env.example` to `.env.local` and fill in the same values.

The Firebase web config is not secret; it is meant to be in the website. Security comes from `firestore.rules`.

### How friends work

- Every signed-in player gets a 6-letter **friend code**.
- Enter a friend's code to send a request. They accept it on their Friends page.
- **Challenge** a friend: you play 12 questions, then they get the *same* questions and try to beat your score.

## Project layout

```
src/
  data/         questions and organelle facts (edit these!)
  art/          SVG drawings: cells, organelle icons, mascot "Cello"
  game/         modes, scoring, progress/streaks/badges, sound, voice
  questions/    one component per question type
  components/   quiz engine, animations, layout
  pages/        Home, Play, Learn, Mistakes, Friends, Classes, Profile
  lib/          Firebase (friends, challenges, classes) + app/notification helpers
  sw.js         service worker (offline, notifications, streak reminder)
```

## Notes

- Progress is saved in the browser (localStorage). Signed-in players also sync XP to Firebase.
- The diagrams are original simplified schematics, not to scale.
