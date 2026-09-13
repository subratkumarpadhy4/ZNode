import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useStore } from '../store.js';
import { BACKEND } from '../api.js';

export function useSocket() {
  const setSnapshot = useStore((s) => s.setSnapshot);
  const applyUpdates = useStore((s) => s.applyUpdates);

  useEffect(() => {
    const socket = io(BACKEND, { reconnection: true, reconnectionDelay: 1000 });

    socket.on('snapshot', (data) => {
      setSnapshot(data);
    });

    socket.on('machine-update', (data) => {
      applyUpdates(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);
}
