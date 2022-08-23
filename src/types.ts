import { TargetKey } from "./lib/targets";

export type Color = [number, number, number];

export type Bits = number | [number, number, number];

export interface Point {
  id?: number;
  color: Color;
  pos: number;
}

export interface Options {
  steps: number;
  blendMode: string;
  ditherMode: string;
  ditherAmount?: number;
  shuffleCount?: number;
  target: TargetKey;
}
