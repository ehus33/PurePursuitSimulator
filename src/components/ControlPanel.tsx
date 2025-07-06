import React from 'react';
import { useStore } from '../hooks/useSimulation';
import type { Params } from '../utils/types';

export function ControlPanel() {
  const {
    params,
    setParams,
    customExtensions,
    addExtension,
    setExtensionLength,
    setExtensionParam,
  } = useStore();

  const renderParamSlider = (
    extIdx: number | null,
    label: string,
    key: keyof Params,
    min: number,
    max: number,
    step: number
  ) => {
    const value = extIdx === null ? params[key] : customExtensions[extIdx].params[key];
    const setter = (val: number) => {
      if (extIdx === null) setParams({ [key]: val });
      else setExtensionParam(extIdx, key, val);
    };
    return (
      <div className="mt-2">
        <label className="block mb-1">
          {label}: {value.toFixed(2)}
        </label>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => setter(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>
    );
  };

  return (
    <div className="space-y-4 border p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-bold">Main Spline Parameters</h2>
      {renderParamSlider(null, 'Lookahead', 'lookahead', 0.1, 2.0, 0.01)}
      {renderParamSlider(null, 'Max Velocity', 'maxVel', 0.1, 2.0, 0.1)}
      {renderParamSlider(null, 'Max Acceleration', 'maxAcc', 0.1, 5.0, 0.1)}
      {renderParamSlider(null, 'Trajectory Samples', 'trajectoryLength', 10, 500, 10)}
      {renderParamSlider(null, 'Path Scale', 'pathScale', 0.1, 3.0, 0.1)}
      {renderParamSlider(null, 'Curvature', 'curvature', -5, 5, 0.1)}

      <div className="mt-6">
        <h3 className="text-md font-semibold">Extensions</h3>
        {customExtensions.map((ext, idx) => (
          <div key={idx} className="mt-4 p-2 border rounded">
            <h4 className="font-medium mb-2">Extension {idx + 1}</h4>
            <div className="mt-2">
              <label className="block mb-1">
                Length: {ext.length.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={ext.length}
                onChange={(e) => setExtensionLength(idx, parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            {(['lookahead','maxVel','maxAcc','trajectoryLength','pathScale','curvature'] as (keyof Params)[]).map(key => {
              const labels: Record<string,string> = {
                lookahead: 'Lookahead',
                maxVel: 'Max Velocity',
                maxAcc: 'Max Acceleration',
                trajectoryLength: 'Trajectory Samples',
                pathScale: 'Path Scale',
                curvature: 'Curvature',
              };
              const minVal = key==='trajectoryLength'?10:key==='maxAcc'?0.1:key==='curvature'?-5:0.1;
              const maxVal = key==='trajectoryLength'?500:key==='maxAcc'?5:key==='curvature'?5:3;
              const stepVal = key==='trajectoryLength'?10:key==='lookahead'?0.01:(key==='curvature'?0.1:0.1);
              const val = ext.params[key];
              const setter = (v: number) => setExtensionParam(idx, key, v);
              return (
                <div key={key} className="mt-2">
                  <label className="block mb-1">
                    {labels[key]}: {val.toFixed(2)}
                  </label>
                  <input
                    type="range"
                    min={minVal}
                    max={maxVal}
                    step={stepVal}
                    value={val}
                    onChange={(e) => setter(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              );
            })}
          </div>
        ))}
        <button
          onClick={addExtension}
          className="mt-4 px-2 py-1 bg-blue-500 text-white rounded"
        >
          Add Extension
        </button>
      </div>
    </div>
  );
}
