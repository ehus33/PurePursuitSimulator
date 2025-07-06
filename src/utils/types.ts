export interface Point {
  x: number;
  y: number;
}

export interface Params {
  lookahead: number;
  maxVel: number;
  maxAcc: number;
  trajectoryLength: number;
  pathScale: number;
  curvature: number;
}

export interface Extension {
  length: number;
  params: Params;
}

export interface Pose {
  x: number;
  y: number;
  theta: number;
}

export interface State {
  start: Point;
  goal: Point;
  obstacles: Point[];
  params: Params;
  customExtensions: Extension[];
  trajectory: Point[];
  pose: Pose;
  t: number;
  addExtension: () => void;
  setExtensionLength: (idx: number, length: number) => void;
  setExtensionParam: (idx: number, key: keyof Params, value: number) => void;
  setParams: (p: Partial<Params>) => void;
  setObstacles: (o: Point[]) => void;
  resetSimulation: () => void;
}
