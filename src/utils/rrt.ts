import type { Point } from './types';

export interface RRTOptions {
  maxIterations: number;
  stepSize: number;
  goalThreshold: number;
  obstacleRadius: number;
  margin: number;
}

export function findPath(
  start: Point,
  goal: Point,
  obstacles: Point[],
  options: RRTOptions
): Point[] {
  interface Node { point: Point; parent: Node | null; }
  const nodes: Node[] = [{ point: start, parent: null }];

  const minX = Math.min(start.x, goal.x);
  const minY = Math.min(start.y, goal.y);
  const maxX = Math.max(start.x, goal.x);
  const maxY = Math.max(start.y, goal.y);

  function dist(a: Point, b: Point): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function collides(a: Point, b: Point): boolean {
    const length = dist(a, b);
    const steps = Math.ceil(length / (options.obstacleRadius / 2));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = a.x + (b.x - a.x) * t;
      const y = a.y + (b.y - a.y) * t;
      for (const o of obstacles) {
        if (Math.hypot(x - o.x, y - o.y) < options.obstacleRadius + options.margin) {
          return true;
        }
      }
    }
    return false;
  }

  for (let i = 0; i < options.maxIterations; i++) {
    const rand = Math.random() < 0.2
      ? goal
      : {
          x: Math.random() * (maxX - minX) + minX,
          y: Math.random() * (maxY - minY) + minY,
        };

    let nearest = nodes[0];
    let bestDist = dist(rand, nearest.point);
    for (const node of nodes) {
      const d = dist(node.point, rand);
      if (d < bestDist) {
        bestDist = d;
        nearest = node;
      }
    }

    const theta = Math.atan2(rand.y - nearest.point.y, rand.x - nearest.point.x);
    const newPoint: Point = {
      x: nearest.point.x + options.stepSize * Math.cos(theta),
      y: nearest.point.y + options.stepSize * Math.sin(theta),
    };

    if (!collides(nearest.point, newPoint)) {
      const newNode: Node = { point: newPoint, parent: nearest };
      nodes.push(newNode);
      if (dist(newPoint, goal) < options.goalThreshold) {
        const path: Point[] = [];
        let curr: Node | null = newNode;
        while (curr) {
          path.push(curr.point);
          curr = curr.parent;
        }
        path.reverse();
        path.unshift(start);
        path.push(goal);
        return path;
      }
    }
  }

  return [start, goal];  
}
