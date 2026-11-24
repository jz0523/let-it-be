import copyJson from '../../content/copy.json';
import sentencesJson from '../../content/sentences.json';
import statementsJson from '../../content/statements.json';
import boxesJson from '../../content/boxes.json';
import whatifsJson from '../../content/whatifs.json';
import checkinJson from '../../content/checkin.json';
import type { GameId } from '../types';

export interface Sentence {
  level: number;
  text: string;
  question?: string;
  /** options[0] matches the card. */
  options?: string[];
}

export interface Statement {
  level: number;
  keep: boolean;
  theme: string;
  text: string;
}

export interface BoxSet {
  level: number;
  theme: string;
  items: string[];
  extras: string[];
}

export const copy = copyJson;
export const sentences = sentencesJson.items as Sentence[];
export const statements = statementsJson.items as Statement[];
export const boxSets = boxesJson.items as BoxSet[];
export const whatifLines = whatifsJson.items as string[];
export const checkin = checkinJson;

/** Fill {name} slots in a line of copy. */
export function fmt(line: string, vars: Record<string, string | number>): string {
  return line.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ''));
}

export function gameName(id: GameId): string {
  return copy.games[id].name;
}
