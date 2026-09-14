import { useEffect, useRef, useState } from 'react';
import React from 'react';
import { useStore } from '../store';
import Scene3D from './Scene3D';
import MachineFloor from './MachineFloor';

// ── Error boundary to auto-fallback from 3D on WebGL errors ──────────────────
class Scene3DErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.warn('Scene3D caught error, falling back to 2D:', error.message);
    this.props.onError();
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

// ── FloorView ─────────────────────────────────────────────────────────────────
export default function FloorView() {
  const floorView    = useStore((s) => s.floorView);
  const setFloorView = useStore((s) => s.setFloorView);
  const [notice, setNotice] = useState(null);
  const fpsRef = useRef({ frames: 0, lastCheck: performance.now() });

  // Mobile default: fall back to 2D
  useEffect(() => {
    if (window.innerWidth < 768 && floorView === '3d') {
      setFloorView('2d');
    }
  }, []);

  // FPS monitor: if rolling avg < 30 over 3 s, switch to 2D
  useEffect(() => {
    if (floorView !== '3d') return;
    let raf;
    const tick = () => {
      const now = performance.now();
      fpsRef.current.frames++;
      if (now - fpsRef.current.lastCheck >= 3000) {
        const fps =
          (fpsRef.current.frames * 1000) /
          (now - fpsRef.current.lastCheck);
        fpsRef.current.frames = 0;
        fpsRef.current.lastCheck = now;
        if (fps < 30) {
          setFloorView('2d');
          setNotice('Switched to 2D view (performance)');
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [floorView]);

  function handleScene3DError() {
    setFloorView('2d');
    setNotice('Switched to 2D view (error)');
  }

  return (
    <div className="floor-view-container">
      {/* 3D / 2D toggle */}
      <div className="floor-toggle">
        <button
          className={floorView === '3d' ? 'active' : ''}
          onClick={() => { setFloorView('3d'); setNotice(null); }}
        >
          3D
        </button>
        <button
          className={floorView === '2d' ? 'active' : ''}
          onClick={() => { setFloorView('2d'); setNotice(null); }}
        >
          2D
        </button>
      </div>

      {floorView === '3d' ? (
        <Scene3DErrorBoundary onError={handleScene3DError}>
          <Scene3D />
        </Scene3DErrorBoundary>
      ) : (
        <MachineFloor />
      )}

      {notice && <div className="floor-notice">{notice}</div>}
    </div>
  );
}
