export function Home() {
  return (
    <div className="pure-g home-container">
      <header className="pure-u-1 header">
        <h2>Ella is amazing</h2>
      </header>
      <div className="pure-u-1 image-container">
        <img src="https://picsum.photos/200/300" alt="Unicorn" />
      </div>
      <main className="pure-u-1 content">
        <div className="pure-u-1">
          <h1>Welcome to Pure.css + Preact</h1>
          <p>Pure.css is a simple, lightweight, and minimal CSS framework.</p>
          <button className="pure-button">Learn more</button>
        </div>
      </main>
    </div>
  );
}
