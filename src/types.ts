import { TargetKey } from "./lib/targets";

// Use enums for components to prevent mixing types:
// https://stackoverflow.com/questions/43831683/can-i-declare-custom-number-types-in-typescript
enum RGBComp {}
enum LRGBComp {}
enum HSVComp {}
enum LABComp {}
enum OKLABComp {}

export type RGB = [RGBComp, RGBComp, RGBComp];
export type LRGB = [LRGBComp, LRGBComp, LRGBComp];
export type HSV = [HSVComp, HSVComp, HSVComp];
export type LAB = [LABComp, LABComp, LABComp];
export type OKLAB = [OKLABComp, OKLABComp, OKLABComp];
export type Color = RGB | LRGB | HSV | LAB | OKLAB;

export type Bits = number | [number, number, number];

export interface Point {
  id?: number;
  color: HSV;
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
