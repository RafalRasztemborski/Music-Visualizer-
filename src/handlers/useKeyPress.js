import { useEffect } from 'react';

export function useKeyPress(key, callback) {
  useEffect(() => {
    function handleKey(e) {
      if (e.code === key) {
        callback();
      }
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [key, callback]);
}
