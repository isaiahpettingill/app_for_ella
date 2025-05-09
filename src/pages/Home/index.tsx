import unicornGif from '../../assets/unicorn.gif';
import './style.css'; // Import the CSS file
import confetti from 'canvas-confetti'; // Import the confetti library

export function Home() {

  // Function to trigger confetti
  const shootConfetti = () => {
    confetti({
      particleCount: 100, // Number of confetti particles
      spread: 70,         // How wide the confetti spreads
      origin: { y: 0.6 }  // Origin point (relative to viewport, 0.6 is a bit above center)
      // You can add more options for colors, shapes, etc.
      // colors: ['#ffdae9', '#c2185b', '#e91e63', '#ffffff'] // Optional: specific colors
    });
  };

  return (
    <div className="pure-g home-container">
      <header className="pure-u-1 header">
        <h2>Ella is amazing</h2>
      </header>

      {/* Add a div to tell Ella how amazing she is */}
      {/* Keep this message as requested earlier */}
      <div className="pure-u-1" style={{ textAlign: 'center', margin: '10px 0' }}>
         <p>Seriously, Ella, you are absolutely amazing!</p>
      </div>

      <div className="pure-u-1 image-container">
          <img src={unicornGif} alt="Unicorn" />
      </div>

      <main className="pure-u-1 content" style={{ textAlign: 'center' }}>
        {/* Removed the h1, p, and "Learn more" button here */}

        {/* Add the new confetti button */}
        <button className="pure-button" onClick={shootConfetti}>
          Shoot Confetti for Ella!
        </button>

      </main>
    </div>
  );
}