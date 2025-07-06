import React from 'react';
import { ControlPanel } from './components/ControlPanel';
import { SimulationCanvas } from './components/SimulationCanvas';
import './index.css';

function App() {
  return (
    <div className="flex p-4 space-x-4">
      <div className="w-1/3">
        <h1 className="text-2xl font-bold mb-4">Robot Simulator</h1>
        <ControlPanel />
      </div>
      <div className="w-2/3">
        <SimulationCanvas />
      </div>
    </div>
  );
}

export default App;
