import { Point, Params } from './types';
import { Bezier } from 'bezier-js';

export function generateSpline(waypoints: Point[], params: Params): Point[] {
  if (waypoints.length < 2) return [];

  let curve: Bezier;
  if (waypoints.length === 2) {
    const [p0, p1] = waypoints;
    curve = new Bezier(p0, p0, p1, p1);
  } else if (waypoints.length === 3) {
    const [p0, p1, p2] = waypoints;
    curve = new Bezier(p0, p1, p2);
  } else {
    const pts = waypoints.slice(0, 4);
    curve = new Bezier(pts[0], pts[1], pts[2], pts[3]);
  }

  const numSamples = Math.max(2, params.trajectoryLength);
  const samples: Point[] = [];
  for (let i = 0; i <= numSamples; i++) {
    const t = i / numSamples;
    const { x, y } = curve.get(t);
    samples.push({ x, y });
  }

  return samples.map(({ x, y }) => ({
    x: x * params.pathScale,
    y: y * params.pathScale,
  }));
}
