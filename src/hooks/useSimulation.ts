import create from 'zustand';
import { generateSpline } from '../utils/spline';
import { findPath, RRTOptions } from '../utils/rrt';
import type { Point, Params, Extension, State } from '../utils/types';

const defaultStart: Point = { x: 0, y: 0 };
const defaultGoal: Point = { x: 2, y: 2 };
const defaultParams: Params = {
  lookahead: 0.5,
  maxVel: 0.5,
  maxAcc: 1.0,
  trajectoryLength: 100,
  pathScale: 1.0,
  curvature: 0,
};
const defaultRRTOptions: RRTOptions = {
  maxIterations: 500,
  stepSize: 0.2,
  goalThreshold: 0.2,
  obstacleRadius: 0.5,
  margin: 0.1,
};

function buildTrajectory(
  basePoints: Point[],
  params: Params,
  extensions: Extension[]
): Point[] {
  let traj = generateSpline(basePoints, params);

  extensions.forEach(ext => {
    if (traj.length < 2) return;
    const prev = traj[traj.length - 2];
    const last = traj[traj.length - 1];
    const dx = last.x - prev.x;
    const dy = last.y - prev.y;
    const mag = Math.hypot(dx, dy) || 1;
    const ux = dx / mag, uy = dy / mag;

    const end: Point = {
      x: last.x + ux * ext.length,
      y: last.y + uy * ext.length
    };

    const mx = (last.x + end.x) / 2;
    const my = (last.y + end.y) / 2;
    const nx = -uy, ny = ux;
    const control: Point = {
      x: mx + nx * ext.params.curvature,
      y: my + ny * ext.params.curvature
    };

    const extSpline = generateSpline([last, control, end], ext.params);
    traj = traj.concat(extSpline.slice(1));
  });

  return traj;
}

export const useStore = create<State>((set, get) => {
  const baseRaw = findPath(defaultStart, defaultGoal, [], defaultRRTOptions);
  const initialTraj = buildTrajectory(baseRaw, defaultParams, []);

  return {
    start: defaultStart,
    goal: defaultGoal,
    obstacles: [],
    params: defaultParams,
    customExtensions: [],
    trajectory: initialTraj,
    pose: { x: 0, y: 0, theta: 0 },
    t: 0,

    setParams: (p) =>
      set((state) => {
        const newParams = { ...state.params, ...p };
        const raw = findPath(state.start, state.goal, state.obstacles, defaultRRTOptions);
        const traj = buildTrajectory(raw, newParams, state.customExtensions);
        return { params: newParams, trajectory: traj };
      }),

    setObstacles: (obs) =>
      set((state) => {
        const raw = findPath(state.start, state.goal, obs, defaultRRTOptions);
        const traj = buildTrajectory(raw, state.params, state.customExtensions);
        return { obstacles: obs, trajectory: traj };
      }),

    addExtension: () =>
      set((state) => {
        const newExt: Extension = { length: 1.0, params: { ...state.params } };
        const exts = [...state.customExtensions, newExt];
        const raw = findPath(state.start, state.goal, state.obstacles, defaultRRTOptions);
        const traj = buildTrajectory(raw, state.params, exts);
        return { customExtensions: exts, trajectory: traj };
      }),

    setExtensionLength: (idx, length) =>
      set((state) => {
        const exts = state.customExtensions.map((e, i) =>
          i === idx ? { ...e, length } : e
        );
        const raw = findPath(state.start, state.goal, state.obstacles, defaultRRTOptions);
        const traj = buildTrajectory(raw, state.params, exts);
        return { customExtensions: exts, trajectory: traj };
      }),

    setExtensionParam: (idx, key, value) =>
      set((state) => {
        const exts = state.customExtensions.map((e, i) =>
          i === idx ? { ...e, params: { ...e.params, [key]: value } } : e
        );
        const raw = findPath(state.start, state.goal, state.obstacles, defaultRRTOptions);
        const traj = buildTrajectory(raw, state.params, exts);
        return { customExtensions: exts, trajectory: traj };
      }),

    resetSimulation: () =>
      set(() => {
        const raw = findPath(defaultStart, defaultGoal, [], defaultRRTOptions);
        const traj = buildTrajectory(raw, defaultParams, []);
        return {
          obstacles: [],
          params: defaultParams,
          customExtensions: [],
          trajectory: traj,
          pose: { x: 0, y: 0, theta: 0 },
          t: 0,
        };
      }),
  };
});
