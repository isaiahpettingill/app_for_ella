import { useState, useEffect, useRef } from 'preact/hooks'; // Import useEffect and useRef
import { route } from 'preact-router'; // Keeping this import for clarity, though preact-iso uses location.href
import confetti from 'canvas-confetti'; // Import confetti

// Import the actual image files
import pushupImageSrc from '../assets/pushup.png'; // Assuming pushup.png is in assets
import pushdownImageSrc from '../assets/pushdown.png'; // Assuming pushdown.png is in assets

export function JamesPage() {

  // State to track pushup count
  const [pushupCount, setPushupCount] = useState(0);
  // State to track the current pushup animation state ('up' or 'down')
  const [pushupState, setPushupState] = useState('up'); // Start in the 'up' position
  // State to track if the animation is currently in progress
  const [isAnimating, setIsAnimating] = useState(false); // New state for animation status
  // State to store the inspirational quote
  const [quote, setQuote] = useState('');

  // Refs to hold the canvas element and the loaded images
  const canvasRef = useRef(null);
  const pushupImg = useRef(new Image());
  const pushdownImg = useRef(new Image());

  // Define a maximum width for the canvas
  const MAX_CANVAS_WIDTH = 600; // You can adjust this value as needed (e.g., 600px)
  // Define the duration of the pushup "down" state
  const ANIMATION_DURATION = 300; // Same as the setTimeout delay

  // Function to fetch a new quote
  const fetchQuote = () => {
    fetch('https://api.realinspire.live/v1/quotes/random')
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          setQuote(`"${data[0].content}" - ${data[0].author}`);
        }
      })
      .catch(error => {
        console.error("Failed to fetch quote:", error);
        setQuote("Keep pushing, you're doing great!"); // Fallback quote for subsequent fetches
      });
  };

  // Load images when the component mounts
  useEffect(() => {
    pushupImg.current.onload = () => {
      // Once the first image loads, draw the initial state
      drawPushup(pushupState === 'up' ? pushupImg.current : pushdownImg.current);
    };
    pushupImg.current.src = pushupImageSrc;

    pushdownImg.current.onload = () => {
      // If pushdown loads after pushup and the state is 'down', draw it
      if (pushupState === 'down') {
         drawPushup(pushdownImg.current);
      }
    };
    pushdownImg.current.src = pushdownImageSrc;

    // Fetch initial inspirational quote
    fetchQuote();

    // Handle window resize to redraw canvas
    const handleResize = () => {
       drawPushup(pushupState === 'up' ? pushupImg.current : pushdownImg.current);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };

  }, []); // Empty dependency array means this runs once on mount

  // Redraw canvas when pushupState changes
  useEffect(() => {
    drawPushup(pushupState === 'up' ? pushupImg.current : pushdownImg.current);
  }, [pushupState]); // Rerun effect when pushupState changes

  // Function to draw the image on the canvas
  const drawPushup = (image) => {
    const canvas = canvasRef.current;
    if (!canvas || !image || !image.complete) {
      return; // Don't draw if canvas or image is not ready
    }

    const context = canvas.getContext('2d');
    const container = canvas.parentElement; // Get the parent container

    // Set canvas dimensions to match container width while maintaining aspect ratio
    const containerWidth = container.offsetWidth;
    const aspectRatio = image.naturalWidth / image.naturalHeight;

    // Calculate the actual width to use, respecting the maximum width
    const canvasWidth = Math.min(containerWidth, MAX_CANVAS_WIDTH);
    const canvasHeight = canvasWidth / aspectRatio;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the image, scaled to fit the canvas
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
  };


  const handlePushupClick = () => {
    // Only allow clicking if not already animating
    if (isAnimating) {
      return;
    }

    // Set animating state to true
    setIsAnimating(true);

    // Increment the pushup count
    const newPushupCount = pushupCount + 1;
    setPushupCount(newPushupCount);

    // Fetch a new quote every 5 pushups
    if (newPushupCount % 5 === 0) {
      fetchQuote();
    }

    // Trigger confetti every 10 pushups
    if (newPushupCount % 10 === 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    // Start the animation: change state to 'down'
    setPushupState('down');

    // After the animation duration, change state back to 'up' and end animation
    setTimeout(() => {
      setPushupState('up');
      setIsAnimating(false); // Set animating state back to false
    }, ANIMATION_DURATION); // Use the defined duration
  };

  const navigateToEllaMode = () => {
    // Use standard browser navigation which preact-iso listens to
    location.href = '/';
  };

  return (
    // Using a similar container class for basic styling
    <div className="pure-g home-container" style={{ backgroundColor: '#e1bee7', color: '#4a148c' }}> {/* Light purple background, dark purple text */}
      <header className="pure-u-1 header" style={{ backgroundColor: '#9c27b0', color: 'white' }}> {/* Medium purple header background, white text */}
        {/* Added inline style to h2 for white text */}
        <h2 style={{ color: 'white' }}>James Mode</h2>
      </header>

      {/* Add a button to navigate back to Ella Mode - REMOVED */}
      {/* 
      <div className="pure-u-1" style={{ textAlign: 'center', margin: '10px 0' }}>
         <button className="pure-button" onClick={navigateToEllaMode} style={{ backgroundColor: '#673ab7', color: 'white' }}> 
           Back to Ella Mode
         </button>
      </div>
      */}

      <main className="pure-u-1 content" style={{ textAlign: 'center', marginTop: '20px' }}>
        <h1>Welcome, James!</h1>
        <p>{quote || 'Loading quote...'}</p>

        {/* Button to do a pushup - disabled when isAnimating is true */}
        <button
          className="pure-button"
          onClick={handlePushupClick}
          disabled={isAnimating} // Disable the button when animating
          style={{ backgroundColor: '#7b1fa2', color: 'white', marginTop: '20px' }}
        > {/* Dark purple button */}
          Do Pushup {pushupCount > 0 ? `(${pushupCount})` : ''} {/* Display count if > 0 */}
        </button>

        {/* Spot for the pushup image - now a canvas */}
        <div className="pure-u-1 image-container" style={{ marginTop: '30px' }}>
           {/* Added inline style to center the canvas within its container */}
           <canvas
             ref={canvasRef}
             aria-label="Pushup Animation"
             style={{ margin: '0 auto', display: 'block' }}
           ></canvas> {/* Add aria-label for accessibility */}
        </div>

      </main>
    </div>
  );
}
