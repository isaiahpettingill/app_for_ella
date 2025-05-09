import { render } from 'preact';
import { LocationProvider, Router, Route } from 'preact-iso';

import { Home } from './pages/Home/index.tsx';
import './style.css';
import { JamesPage } from './pages/JamesPage.tsx';

export function App() {
  return (
    <LocationProvider>
      <div className="pure-g" style="height: 100vh;">
        <div className="pure-u-1">
          <Router>
            <Route path="/" component={Home} />
            <Route path="/James" component={JamesPage} />
            <Route default component={Home} />
          </Router>
        </div>
      </div>
    </LocationProvider>
  );
}

render(<App />, document.getElementById('app'));
