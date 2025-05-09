import { useState } from 'preact/hooks';

export function Home() {
  const [count, setCount] = useState(0);

  return (
    <div class="counter">
      <div class="count-display">You have pushed the button this many times:</div>
      <div class="count-value">{count}</div>
      <button aria-label="Increment counter" onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}
