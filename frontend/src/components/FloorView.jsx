import React, { useEffect } from 'react';
import { useStore } from '../store';
import Scene3D from './Scene3D';
import MachineFloor from './MachineFloor';

class SceneErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error?.message || 'Unknown error' };
  }

  componentDidCatch(error, info) {
    console.error('[Scene3D] Runtime error:', error);
    console.error('[Scene3D] Component stack:', info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <MachineFloor />
          <div style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            background: 'rgba(239, 68, 68, 0.9)',
            color: '#fff',
            padding: '8px 14px',
            borderRadius: 6,
            fontSize: 12,
            fontFamily: 'monospace',
            maxWidth: 500
          }}>
            3D scene error: {this.state.errorMessage}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function FloorView() {
  const floorView = useStore((s) => s.floorView);
  const setFloorView = useStore((s) => s.setFloorView);

  // Responsive default: mobile opens in 2D, desktop opens in 3D.
  useEffect(() => {
    if (window.innerWidth < 768 && floorView === '3d') {
      setFloorView('2d');
    }
  }, []);

  return (
    <div className="floor-view-container">
      <div className="floor-toggle">
        <button
          className={floorView === '3d' ? 'active' : ''}
          onClick={() => setFloorView('3d')}
        >3D</button>
        <button
          className={floorView === '2d' ? 'active' : ''}
          onClick={() => setFloorView('2d')}
        >2D</button>
      </div>

      {floorView === '3d' ? (
        <SceneErrorBoundary>
          <Scene3D />
        </SceneErrorBoundary>
      ) : (
        <MachineFloor />
      )}
    </div>
  );
}
