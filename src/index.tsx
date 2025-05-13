import { render, h } from 'preact';
import { LocationProvider, Router, Route } from 'preact-iso';
import { route } from 'preact-router';
import { Home } from './pages/Home/index.tsx';
import { JamesPage } from './pages/JamesPage.tsx';
import { MobileOS } from './pages/Apps/MobileOS.tsx';
import { WeatherPage } from './pages/Weather/WeatherPage.tsx';
import Bees from './pages/Bee/Bees.tsx';
import { ArrowUturnLeftIcon, HomeIcon as HeroHomeIcon, Squares2X2Icon } from '@heroicons/react/24/outline';

import './style.css';
import { Mail } from './pages/Mail/Mail.tsx';
import { Notes } from './pages/Notes/Notes.tsx';

export function App() {
  const goBack = () => window.history.back();
  const handleNav = (e: h.JSX.TargetedMouseEvent<HTMLAnchorElement>, to: string) => {
    e.preventDefault();
    route(to);
  };

  return (
    <LocationProvider>
      <div className="main-app-container">
        <div className="content-wrap">
          <Router>
            <Route path="/" component={Home} />
            <Route path="/James" component={JamesPage} />
            <Route path="/mobile" component={MobileOS} />
            <Route path="/mail" component={Mail} />
            <Route path="/weather" component={WeatherPage} />
            <Route path="/bees" component={Bees} />
            <Route path="/notes" component={Notes} />
            <Route default component={Home} />
          </Router>
        </div>
        <nav className="mobile-nav-bar">
          <button className="mobile-nav-button" onClick={goBack} aria-label="Go back">
            <ArrowUturnLeftIcon />
          </button>
          <a href="/mobile" className="mobile-nav-button" onClick={(e) => handleNav(e, '/mobile')} aria-label="Mobile Home Screen">
            <HeroHomeIcon />
          </a>
          <button className="mobile-nav-button" aria-label="Open Apps">
            <Squares2X2Icon />
          </button>
        </nav>
      </div>
    </LocationProvider>
  );
}

render(<App />, document.getElementById('app'));
