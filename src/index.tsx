import { render } from 'preact';
import { LocationProvider, Router, Route } from 'preact-iso';

import { Home } from './pages/Home/index.tsx';
import { NotFound } from './pages/_404.tsx';
import './style.css';

export function App() {
  return (
    <LocationProvider>
      <Router>
        <main class="container-fluid">
          <Route path="/" component={Home} />
          <Route default component={NotFound} />
        </main>
      </Router>
    </LocationProvider>
  );
}

render(<App />, document.getElementById('app'));
