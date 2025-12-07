import type { Move, Choice } from "../types";

export type RoundDelta = {
  id: number;
  move: Move;
  delta: number;
};

export type RoundEvaluation = {
  deltas: RoundDelta[];
  winners: number[];
  isDraw: boolean;
};

const MOVES: Move[] = ["rock", "paper", "scissors"];

const WINNER_MAP: Record<`${Move}${Move}`, 0 | 1 | 2> = {
  rockrock: 0,
  rockpaper: 2,
  rockscissors: 1,
  paperrock: 1,
  paperpaper: 0,
  paperscissors: 2,
  scissorsrock: 2,
  scissorspaper: 1,
  scissorsscissors: 0,
};

export const MOVES_ORDER = [...MOVES];

export const getRandomMove = (): Move =>
  MOVES[Math.floor(Math.random() * MOVES.length)];

export const evaluateRound = (choices: Choice[]): RoundEvaluation => {
  if (choices.length < 2) {
    throw new Error("Se necesitan al menos dos elecciones para jugar.");
  }

  const deltas = new Map<number, number>();
  choices.forEach((choice) => {
    deltas.set(choice.id, 0);
  });

  for (let i = 0; i < choices.length; i++) {
    for (let j = i + 1; j < choices.length; j++) {
      const key = `${choices[i].move}${choices[j].move}` as `${Move}${Move}`;
      const result = WINNER_MAP[key];
      if (result === 1) {
        deltas.set(choices[i].id, (deltas.get(choices[i].id) ?? 0) + 1);
      } else if (result === 2) {
        deltas.set(choices[j].id, (deltas.get(choices[j].id) ?? 0) + 1);
      }
    }
  }

  const scores = Array.from(deltas.values());
  const maxScore = Math.max(...scores);
  const winners = maxScore === 0
    ? []
    : Array.from(deltas.entries())
        .filter(([, value]) => value === maxScore)
        .map(([id]) => id);

  return {
    deltas: choices.map((choice) => ({
      id: choice.id,
      move: choice.move,
      delta: deltas.get(choice.id) ?? 0,
    })),
    winners,
    isDraw: maxScore === 0,
  };
};