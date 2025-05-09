import { useState } from 'preact/hooks';

export function Home() {
  const [count, setCount] = useState(0);

  return (
    <div class="counter">
      <h1>Counter: {count}</h1>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
