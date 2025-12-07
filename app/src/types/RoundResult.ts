import type { Move } from "./Move";

export type RoundBreakdown = {
  id: number;
  name: string;
  move: Move;
  delta: number;
};

export type RoundResult = {
  round: number;
  headline: string;
  flavor: string;
  breakdown: RoundBreakdown[];
};
