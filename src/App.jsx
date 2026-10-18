import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProgressProvider } from './game/progress.jsx';
import { SocialProvider } from './lib/social.jsx';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Modes from './pages/Modes.jsx';
import Play from './pages/Play.jsx';
import Learn from './pages/Learn.jsx';
import Mistakes from './pages/Mistakes.jsx';
import Friends from './pages/Friends.jsx';
import Profile from './pages/Profile.jsx';
import Classes from './pages/Classes.jsx';
import Assignment from './pages/Assignment.jsx';
import Room from './pages/Room.jsx';

// HashRouter: URLs look like /#/play/sprint, which works on GitHub Pages
// without any server-side routing.
export default function App() {
  return (
    <ProgressProvider>
      <SocialProvider>
        <HashRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="play" element={<Modes />} />
              <Route path="play/:modeId" element={<Play />} />
              <Route path="learn" element={<Learn />} />
              <Route path="learn/:organelleId" element={<Learn />} />
              <Route path="mistakes" element={<Mistakes />} />
              <Route path="friends" element={<Friends />} />
              <Route path="profile" element={<Profile />} />
              <Route path="classes" element={<Classes />} />
              <Route path="class/:cid/a/:aid" element={<Assignment />} />
              <Route path="class/:cid/room/:rid" element={<Room />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </HashRouter>
      </SocialProvider>
    </ProgressProvider>
  );
}
