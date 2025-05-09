import { useState } from 'preact/hooks';
// Remove the import for 'route' from 'preact-router'
// import { route } from 'preact-router';
import unicornGif from '../../assets/unicorn.gif';
import './style.css'; // Import the CSS file
import confetti from 'canvas-confetti'; // Import the confetti library

// We no longer need the onNavigateToJamesMode prop with preact-iso
export function Home() {

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleMenuItemClick = (mode) => {
    setIsDropdownOpen(false); // Close dropdown after selection
    if (mode === 'james') {
      // Use standard browser navigation which preact-iso listens to
      location.href = '/James';
    }
    // Add more modes here if needed
  };

  return (
    <div className="pure-g home-container">
      {/* Combined Header and Navigation */}
      <header className="pure-u-1 header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px' }}>
        <h2>Ella is amazing</h2>
        {/* Navigation Dropdown */}
        <div style={{ position: 'relative' }}>
          <button className="pure-button" onClick={toggleDropdown} style={{ backgroundColor: '#e91e63', color: 'white' }}>
            Modes ▼
          </button>
          {isDropdownOpen && (
            <ul style={{
              position: 'absolute',
              top: '100%',
              right: 0, // Align dropdown to the right of the button
              backgroundColor: 'white', // White background for the dropdown
              border: '1px solid #ccc',
              listStyle: 'none',
              padding: '0',
              margin: '5px 0 0 0',
              zIndex: 10, // Ensure dropdown is above other content
              minWidth: '120px',
              textAlign: 'left',
              borderRadius: '4px'
            }}>
              <li
                onClick={() => handleMenuItemClick('james')}
                style={{
                  padding: '10px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                  color: '#333' // Dark text for menu items
                }}
              >
                James Mode
              </li>
              {/* Add other menu items here */}
            </ul>
          )}
        </div>
      </header>

      {/* Add a div to tell Ella how amazing she is */}
      <div className="pure-u-1" style={{ textAlign: 'center', margin: '10px 0' }}>
         <p>Seriously, Ella, you are absolutely amazing!</p>
      </div>

      <div className="pure-u-1 image-container">
          <img src={unicornGif} alt="Unicorn" />
      </div>

      <main className="pure-u-1 content" style={{ textAlign: 'center' }}>
        {/* Add the new confetti button */}
        <button className="pure-button" onClick={shootConfetti}>
          Shoot Confetti for Ella!
        </button>
      </main>
    </div>
  );
}
