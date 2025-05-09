import { useState, useMemo } from 'preact/hooks';
// Remove the import for 'route' from 'preact-router'
// import { route } from 'preact-router';
import unicornGif from '../../assets/unicorn.gif';
import './style.css'; // Import the CSS file
import confetti from 'canvas-confetti'; // Import the confetti library

const adjectives = [
  "amazing", "beautiful", "the best", "kind", "wonderful", "skilled", "powerful", "strong", "gentle", "faithful",
  "brilliant", "charming", "creative", "dazzling", "elegant", "energetic", "fabulous", "glorious", "graceful",
  "impressive", "incredible", "magnificent", "marvelous", "outstanding", "phenomenal", "radiant", "remarkable",
  "spectacular", "splendid", "superb", "talented", "terrific", "vibrant", "wise", "witty"
];

// Added more heart emojis
const emojiList = ['💖', '❤️', '💕', '💗', '💓', '💞', '💜', '💙', '💚', '💛', '🤟', '😊', '✨', '🎉', '🤡', '🦄', '🦆', '🥭', '🍓', '🤩', '🌟', '🦦', '🫶'];
const animationClasses = ['adjective-animate', 'adjective-shake', 'adjective-pulse'];

// We no longer need the onNavigateToJamesMode prop with preact-iso
export function Home() {
  const [currentAdjective, setCurrentAdjective] = useState(adjectives[0]);
  const [confettiClickCount, setConfettiClickCount] = useState(0);
  const [animateAdjective, setAnimateAdjective] = useState(false);
  const [currentAnimationClass, setCurrentAnimationClass] = useState(animationClasses[0]);

  // Memoize emoji shapes for confetti
  const emojiShapes = useMemo(() => {
    if (typeof confetti.shapeFromText === 'function') {
      return emojiList.map(emoji => confetti.shapeFromText({ text: emoji, scalar: 2 }));
    }
    return []; // Fallback if shapeFromText is not available
  }, []);


  // Function to trigger confetti
  const shootConfetti = () => {
    const newClickCount = confettiClickCount + 1;
    setConfettiClickCount(newClickCount);

    if (newClickCount > 0 && newClickCount % 10 === 0) {
      const nextAdjectiveIndex = Math.floor(newClickCount / 10) % adjectives.length;
      setCurrentAdjective(adjectives[nextAdjectiveIndex]);
    }

    if (newClickCount > 0 && newClickCount % 7 === 0) {
      const nextAnimationIndex = Math.floor(newClickCount / 7) % animationClasses.length;
      setCurrentAnimationClass(animationClasses[nextAnimationIndex]);
    }

    setAnimateAdjective(true);
    setTimeout(() => {
      setAnimateAdjective(false);
    }, 1000); // Animation duration + buffer

    // Launch standard confetti
    confetti({
      particleCount: 50, // Keep some standard confetti
      spread: 60,
      origin: { y: 0.6 }
    });

    // Launch emoji confetti if shapes are available
    if (emojiShapes.length > 0) {
      confetti({
        particleCount: 50, // Increased emoji particles
        spread: 100,
        origin: { y: 0.65 }, // Slightly different origin for variety
        shapes: emojiShapes,
        scalar: 1.5 // Overall scalar for the emoji shapes launch
      });
    }
  };

  // This class is now only for the paragraph's adjective
  const paragraphAdjectiveSpanClass = animateAdjective ? `rainbow-text ${currentAnimationClass}` : '';

  return (
    <div className="pure-g home-container">
      {/* Combined Header and Navigation */}
      <header className="pure-u-1 header" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px 20px' }}> {/* Centered header content */}
        <h2>
          Ella is {' '}
          {/* Header adjective is now plain white, no special class or inline style needed here as h2 is white via CSS */}
          <span>
            {currentAdjective}
          </span>
        </h2>
      </header>

      {/* Add a div to tell Ella how amazing she is */}
      <div className="pure-u-1" style={{ textAlign: 'center', margin: '20px 0', fontSize: '1.2em' }}>
         <p>
           Seriously, Ella, you are absolutely {' '}
           <span className={paragraphAdjectiveSpanClass}>
             {currentAdjective}
           </span>!
         </p>
      </div>

      <div className="pure-u-1 image-container">
          <img src={unicornGif} alt="Unicorn" />
      </div>

      <main className="pure-u-1 content" style={{ textAlign: 'center' }}>
        {/* Add the new confetti button */}
        <button className="pure-button" onClick={shootConfetti} style={{padding: '15px 30px', fontSize: '1.2em'}}>
          Shoot Confetti for Ella!
        </button>
      </main>

      {/* Footer section for James Mode link */}
      <footer className="pure-u-1" style={{ textAlign: 'center', padding: '20px 0' }}>
        <a href="/James" className="james-mode-link">
          James Mode
        </a>
      </footer>
    </div>
  );
}
