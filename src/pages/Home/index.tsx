import { useState, useMemo, useEffect } from 'preact/hooks';
// Remove the import for 'route' from 'preact-router'
// import { route } from 'preact-router';
import unicornGif from '../../assets/unicorn.gif';
import './style.css'; // Import the CSS file
import confetti from 'canvas-confetti'; // Import the confetti library
import { useEllaAdjectives } from '../../api/hooks/useEllaAdjectives';
import { useMeetupDates } from '../../api/hooks/useMeetupDates';
import { CalendarIcon } from '../../components/calendar/CalendarIcon';

// Function to shuffle an array (Fisher-Yates shuffle)
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array]; // Create a copy to avoid mutating the original constant
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]; // Swap elements
  }
  return newArray;
};

// Added more heart emojis
const emojiList = ['💖', '❤️', '💕', '💗', '💓', '💞', '💜', '💙', '💚', '💛', '🤟', '😊', '✨', '☀️', '🌞', '🌈', '💐', '🌷', '🪻', '🎉', '🤡', '🦄', '🦆', '🥭', '🍓', '🤩', '🌟', '🦦', '🫶'];
const animationClasses = ['adjective-animate', 'adjective-shake', 'adjective-pulse'];

export function Home() {
  const { adjectives, loading, error } = useEllaAdjectives();
  const { meetupDates, loading: meetupLoading, getMeetupDates } = useMeetupDates();
  const [currentAdjective, setCurrentAdjective] = useState(['', '']);
  const [confettiClickCount, setConfettiClickCount] = useState(0);
  const [animateAdjective, setAnimateAdjective] = useState(false);
  const [currentAnimationClass, setCurrentAnimationClass] = useState(animationClasses[0]);
  const [unicornSpin, setUnicornSpin] = useState(false);

  // Memoize emoji shapes for confetti
  const emojiShapes = useMemo(() => {
    if (typeof confetti.shapeFromText === 'function') {
      return emojiList.map(emoji => confetti.shapeFromText({ text: emoji, scalar: 2 }));
    }
    return []; // Fallback if shapeFromText is not available
  }, []);

  // Shuffle adjectives on component mount and store the shuffled array
  const shuffledAdjectives = useMemo(() => {
    if (!adjectives || adjectives.length === 0) return [];
    return shuffleArray(adjectives.map(a => [a.adverb, a.adjective]));
  }, [adjectives]);

  // Set the initial adjective from the shuffled list when adjectives are loaded
  useEffect(() => {
    if (shuffledAdjectives.length > 0) {
      setCurrentAdjective(shuffledAdjectives[0]);
    }
  }, [shuffledAdjectives]);

  // Function to trigger confetti
  const shootConfetti = () => {
    const newClickCount = confettiClickCount + 1;
    setConfettiClickCount(newClickCount);

    if (newClickCount > 0 && newClickCount % 25 === 0) {
      setUnicornSpin(true);
    }

    if (newClickCount > 0 && newClickCount % 10 === 0) {
      const nextAdjectiveIndex = Math.floor(newClickCount / 10) % shuffledAdjectives.length;
      setCurrentAdjective(shuffledAdjectives[nextAdjectiveIndex]);
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

  // Only animate the adjective (not the adverb)
  const adverb = currentAdjective[0] ? currentAdjective[0] + ' ' : '';
  const adjective = currentAdjective[1] || '';

  // This class is now only for the paragraph's adjective
  const paragraphAdjectiveSpanClass = animateAdjective ? `rainbow-text ${currentAnimationClass}` : '';

  if (loading) {
    return <div className="home-container"><p>Loading adjectives...</p></div>;
  }

  if (error) {
    return <div className="home-container"><p>Error loading adjectives: {error}</p></div>;
  }

  return (
    <div className="pure-g home-container">
      {/* Combined Header and Navigation */}
      <header className="pure-u-1 header" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px 20px' }}> {/* Centered header content */}
        <h2>
          Ella is {' '}
          <span>
            {adjective}
          </span>
        </h2>
      </header>

      {/* Add a div to tell Ella how amazing she is */}
      <div className="pure-u-1 ella-message" style={{ textAlign: 'center' }}>
         <p>
           Seriously, Ella, you are{' '}
           <span>
             {adverb}
             <span className={paragraphAdjectiveSpanClass}>{adjective}</span>
           </span>!
         </p>
      </div>

      <div className="pure-u-1 image-container">
          <img
            src={unicornGif}
            alt="Unicorn"
            className={unicornSpin ? 'unicorn-spin' : ''}
            onAnimationEnd={() => setUnicornSpin(false)}
          />
      </div>

      <main className="pure-u-1 content" style={{ textAlign: 'center' }}>
        {/* Add the new confetti button */}
        <button className="pure-button" onClick={shootConfetti} style={{padding: '15px 30px', fontSize: '1.2em'}}>
          Shoot Confetti for Ella!
        </button>
      </main>

    </div>
  );
}
