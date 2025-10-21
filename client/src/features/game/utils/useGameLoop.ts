import { useEffect, useRef } from 'react';

export function useGameLoop(callback: (dt: number) => void, active: boolean) {
  const callbackRef = useRef(callback);
  const frameRef = useRef<number>();
  const lastTimeRef = useRef<number>();

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!active) {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      frameRef.current = undefined;
      lastTimeRef.current = undefined;
      return;
    }

    const step = (time: number) => {
      if (lastTimeRef.current != null) {
        const dt = (time - lastTimeRef.current) / 1000;
        callbackRef.current(dt);
      }
      lastTimeRef.current = time;
      frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      frameRef.current = undefined;
      lastTimeRef.current = undefined;
    };
  }, [active]);
}
