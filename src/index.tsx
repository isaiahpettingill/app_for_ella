import { render } from 'preact';
import { LocationProvider, Router, Route } from 'preact-iso';

import { Home } from './pages/Home/index.tsx';
import { NotFound } from './pages/_404.tsx';
import './style.css';

export function App() {
  return (
    <LocationProvider>
      <div className="pure-g" style="height: 100vh;">
        <div className="pure-u-1">
          <Router>
            <Route path="/" component={Home} />
            <Route default component={NotFound} />
          </Router>
        </div>
      </div>
    </LocationProvider>
  );
}

render(<App />, document.getElementById('app'));
