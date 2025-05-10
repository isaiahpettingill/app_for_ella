import { h } from 'preact';
import { useRef, useState, useMemo } from 'preact/hooks';
import beeImg from '../../assets/bee.jpg';
import confetti from 'canvas-confetti';

const beeEmojis = ['☀️', '🍯'];

export default function Bees() {
  const imgRef = useRef<HTMLImageElement>(null);
  const [swipeCount, setSwipeCount] = useState(0);

  // Memoize emoji shapes for confetti
  const emojiShapes = useMemo(() => {
    if (typeof confetti.shapeFromText === 'function') {
      return beeEmojis.map(emoji => confetti.shapeFromText({ text: emoji, scalar: 2 }));
    }
    return [];
  }, []);

  // Handle swipe (touchmove or pointermove)
  const handlePointerMove = (e: PointerEvent) => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    // Optionally, add a little shake effect
    if (imgRef.current) {
      imgRef.current.style.transform = 'translateX(2px) rotate(-2deg)';
      setTimeout(() => {
        if (imgRef.current) imgRef.current.style.transform = '';
      }, 100);
    }
    // Count swipes and shoot confetti every 3 swipes
    setSwipeCount(prev => {
      const next = prev + 1;
      if (next % 3 === 0) {
        if (emojiShapes.length > 0) {
          confetti({
            particleCount: 40,
            spread: 80,
            origin: { y: 0.7 },
            shapes: emojiShapes,
            scalar: 1.7
          });
        } else {
          // fallback: just shoot normal confetti
          confetti({ particleCount: 40, spread: 80, origin: { y: 0.7 } });
        }
      }
      return next;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', background: 'linear-gradient(to bottom, #87ceeb 0%, #b3e0ff 100%)' }}>
      <h2 style={{ marginBottom: '1em', color: '#f9b000', textShadow: '1px 1px 8px #fff' }}>Pet a bee!</h2>
      <img
        ref={imgRef}
        src={beeImg}
        alt="Bee"
        style={{ width: '220px', height: '220px', objectFit: 'cover', borderRadius: '1em', boxShadow: '0 4px 16px #0002', cursor: 'pointer', background: '#fffbe6' }}
        onPointerMove={handlePointerMove}
        draggable={false}
      />
    </div>
  );
} 