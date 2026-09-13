import React, { useState } from 'react';
import { useSocket } from './hooks/useSocket.js';
import { useStore } from './store.js';
import TopBar from './components/TopBar.jsx';
import Nav from './components/Nav.jsx';
import MachineFloor from './components/MachineFloor.jsx';
import KPITiles from './components/KPITiles.jsx';
import ActivityFeed from './components/ActivityFeed.jsx';
import DetailsPanel from './components/DetailsPanel.jsx';
import EnergyTab from './components/EnergyTab.jsx';
import EmissionsTab from './components/EmissionsTab.jsx';
import CarbonWhatIf from './components/CarbonWhatIf.jsx';

export default function App() {
  useSocket();
  const [activeTab, setActiveTab] = useState('today');
  const selectedMachineId = useStore((s) => s.selectedMachineId);

  return (
    <div className="app">
      <TopBar />
      <Nav activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {activeTab === 'today' && (
          <>
            <MachineFloor />
            <KPITiles />
            <ActivityFeed />
          </>
        )}
        {activeTab === 'analytics' && <EnergyTab />}
        {activeTab === 'savings' && (
          <>
            <EmissionsTab />
            <CarbonWhatIf />
          </>
        )}
      </main>
      {selectedMachineId && <DetailsPanel />}
    </div>
  );
}
