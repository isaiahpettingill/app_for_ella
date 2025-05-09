import { render } from 'preact';
import { LocationProvider, Router, Route } from 'preact-iso';

import { Home } from './pages/Home/index.tsx';
import { NotFound } from './pages/_404.tsx';
import './style.css';
import { JamesPage } from './pages/Home/JamesPage.tsx';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

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
