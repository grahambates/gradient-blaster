/*
 * quantize.js Copyright 2008 Nick Rabinowitz
 * Ported to node.js by Olivier Lesnicki
 * Ported to Typescript by Graham Bates
 * Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 */

import { RGB } from "../types";

interface PItem {
  vbox: VBox,
  color: RGB
}

function naturalOrder(a: number, b: number): number {
  return (a < b) ? -1 : ((a > b) ? 1 : 0);
}

// private constants
const sigbits = 5
const rshift = 8 - sigbits
const maxIterations = 1000
const fractByPopulations = 0.75;

// get reduced-space color index for a pixel

function getColorIndex(r: number, g: number, b: number) {
  return (r << (2 * sigbits)) + (g << sigbits) + b;
}

// Simple priority queue

class PQueue<T> {
  private contents: T[] = [];
  private sorted = false;

  constructor(private comparator: (a: T, b: T) => number) { }

  sort() {
    this.contents.sort(this.comparator);
    this.sorted = true;
  }

  push(o: T) {
    this.contents.push(o);
    this.sorted = false;
  }
  peek(index: number) {
    if (!this.sorted) this.sort();
    if (index === undefined) index = this.contents.length - 1;
    return this.contents[index];
  }
  pop() {
    if (!this.sorted) this.sort();
    return this.contents.pop();
  }
  size() {
    return this.contents.length;
  }
  map<U>(f: (value: T, index: number, array: T[]) => U, thisArg?: any): U[] {
    return this.contents.map(f);
  }
  debug() {
    if (!this.sorted) this.sort();
    return this.contents;
  }
}

// 3d color space box

class VBox {
  private _volume: number | undefined;
  private _count: number | undefined;
  private _avg: RGB | undefined;
  private _count_set = false;

  constructor(public r1: number, public r2: number, public g1: number, public g2: number, public b1: number, public b2: number, public histo: number[]) { }

  volume(force?: boolean) {
    if (!this._volume || force) {
      this._volume = ((this.r2 - this.r1 + 1) * (this.g2 - this.g1 + 1) * (this.b2 - this.b1 + 1));
    }
    return this._volume;
  }
  count(force?: boolean): number {
    if (!this._count_set || force) {
      let npix = 0,
        i, j, k, index;
      for (i = this.r1; i <= this.r2; i++) {
        for (j = this.g1; j <= this.g2; j++) {
          for (k = this.b1; k <= this.b2; k++) {
            index = getColorIndex(i, j, k);
            npix += (this.histo[index] || 0);
          }
        }
      }
      this._count = npix;
      this._count_set = true;
    }
    return this._count as number;
  }
  copy(): VBox {
    return new VBox(this.r1, this.r2, this.g1, this.g2, this.b1, this.b2, this.histo);
  }
  avg(force?: boolean): RGB {
    if (!this._avg || force) {
      let ntot = 0,
        mult = 1 << (8 - sigbits),
        rsum = 0,
        gsum = 0,
        bsum = 0,
        hval,
        i, j, k, histoindex;
      for (i = this.r1; i <= this.r2; i++) {
        for (j = this.g1; j <= this.g2; j++) {
          for (k = this.b1; k <= this.b2; k++) {
            histoindex = getColorIndex(i, j, k);
            hval = this.histo[histoindex] || 0;
            ntot += hval;
            rsum += (hval * (i + 0.5) * mult);
            gsum += (hval * (j + 0.5) * mult);
            bsum += (hval * (k + 0.5) * mult);
          }
        }
      }
      if (ntot) {
        this._avg = [~~(rsum / ntot), ~~(gsum / ntot), ~~(bsum / ntot)];
      } else {
        this._avg = [~~(mult * (this.r1 + this.r2 + 1) / 2), ~~(mult * (this.g1 + this.g2 + 1) / 2), ~~(mult * (this.b1 + this.b2 + 1) / 2)];
      }
    }
    return this._avg as RGB;
  }
  contains(pixel: RGB) {
    let rval = pixel[0] >> rshift;
    let gval = pixel[1] >> rshift;
    let bval = pixel[2] >> rshift;
    return (rval >= this.r1 && rval <= this.r2 &&
      gval >= this.g1 && gval <= this.g2 &&
      bval >= this.b1 && bval <= this.b2);
  }
};

// Color map

class CMap {
  private vboxes: PQueue<PItem>;

  constructor() {
    this.vboxes = new PQueue(function (a, b) {
      return naturalOrder(
        a.vbox.count() * a.vbox.volume(),
        b.vbox.count() * b.vbox.volume()
      )
    });
  }

  push(vbox: VBox) {
    this.vboxes.push({
      vbox: vbox,
      color: vbox.avg()
    });
  }
  palette() {
    return this.vboxes.map((vb) => vb.color);
  }
  size() {
    return this.vboxes.size();
  }
  map(color: RGB) {
    let vboxes = this.vboxes;
    for (let i = 0; i < vboxes.size(); i++) {
      if (vboxes.peek(i).vbox.contains(color)) {
        return vboxes.peek(i).color;
      }
    }
    return this.nearest(color);
  }
  nearest(color: RGB): RGB {
    let vboxes = this.vboxes;
    let d1: number | undefined;
    let pColor: RGB | undefined;
    for (let i = 0; i < vboxes.size(); i++) {
      let d2 = Math.sqrt(
        Math.pow(color[0] - vboxes.peek(i).color[0], 2) +
        Math.pow(color[1] - vboxes.peek(i).color[1], 2) +
        Math.pow(color[2] - vboxes.peek(i).color[2], 2)
      );
      if (d1 === undefined || d2 < d1) {
        d1 = d2;
        pColor = vboxes.peek(i).color;
      }
    }
    return pColor as RGB;
  }
  /*
  forcebw() {
    // XXX: won't  work yet
    this.vboxes.sort();

    // force darkest color to black if everything < 5
    let lowest = this.vboxes[0].color;
    if (lowest[0] < 5 && lowest[1] < 5 && lowest[2] < 5)
      this.vboxes[0].color = [0, 0, 0];

    // force lightest color to white if everything > 251
    let idx = this.vboxes.length - 1,
      highest = this.vboxes[idx].color;
    if (highest[0] > 251 && highest[1] > 251 && highest[2] > 251)
      this.vboxes[idx].color = [255, 255, 255];
  }
  */
};

// histo (1-d array, giving the number of pixels in
// each quantized region of color space), or null on error

function getHisto(pixels: RGB[]) {
  let histosize = 1 << (3 * sigbits),
    histo = new Array(histosize),
    index, rval, gval, bval;
  pixels.forEach(function (pixel) {
    rval = pixel[0] >> rshift;
    gval = pixel[1] >> rshift;
    bval = pixel[2] >> rshift;
    index = getColorIndex(rval, gval, bval);
    histo[index] = (histo[index] || 0) + 1;
  });
  return histo;
}

function vboxFromPixels(pixels: RGB[], histo: number[]) {
  let rmin = 1000000,
    rmax = 0,
    gmin = 1000000,
    gmax = 0,
    bmin = 1000000,
    bmax = 0,
    rval, gval, bval;
  // find min/max
  pixels.forEach(function (pixel) {
    rval = pixel[0] >> rshift;
    gval = pixel[1] >> rshift;
    bval = pixel[2] >> rshift;
    if (rval < rmin) rmin = rval;
    else if (rval > rmax) rmax = rval;
    if (gval < gmin) gmin = gval;
    else if (gval > gmax) gmax = gval;
    if (bval < bmin) bmin = bval;
    else if (bval > bmax) bmax = bval;
  });
  return new VBox(rmin, rmax, gmin, gmax, bmin, bmax, histo);
}

function medianCutApply(histo: number[], vbox: VBox) {
  if (!vbox.count()) return;

  let rw = vbox.r2 - vbox.r1 + 1,
    gw = vbox.g2 - vbox.g1 + 1,
    bw = vbox.b2 - vbox.b1 + 1,
    maxw = Math.max(rw, gw, bw);
  // only one pixel, no split
  if (vbox.count() === 1) {
    return [vbox.copy()]
  }
  /* Find the partial sum arrays along the selected axis. */
  let total = 0,
    partialsum: number[] = [],
    lookaheadsum: number[] = [],
    i, j, k, sum, index;
  if (maxw === rw) {
    for (i = vbox.r1; i <= vbox.r2; i++) {
      sum = 0;
      for (j = vbox.g1; j <= vbox.g2; j++) {
        for (k = vbox.b1; k <= vbox.b2; k++) {
          index = getColorIndex(i, j, k);
          sum += (histo[index] || 0);
        }
      }
      total += sum;
      partialsum[i] = total;
    }
  } else if (maxw === gw) {
    for (i = vbox.g1; i <= vbox.g2; i++) {
      sum = 0;
      for (j = vbox.r1; j <= vbox.r2; j++) {
        for (k = vbox.b1; k <= vbox.b2; k++) {
          index = getColorIndex(j, i, k);
          sum += (histo[index] || 0);
        }
      }
      total += sum;
      partialsum[i] = total;
    }
  } else { /* maxw == bw */
    for (i = vbox.b1; i <= vbox.b2; i++) {
      sum = 0;
      for (j = vbox.r1; j <= vbox.r2; j++) {
        for (k = vbox.g1; k <= vbox.g2; k++) {
          index = getColorIndex(j, k, i);
          sum += (histo[index] || 0);
        }
      }
      total += sum;
      partialsum[i] = total;
    }
  }
  partialsum.forEach(function (d, i) {
    lookaheadsum[i] = total - d
  });

  function doCut(color: 'r' | 'g' | 'b') {
    let dim1 = color + '1',
      dim2 = color + '2',
      left, right, vbox1, vbox2, d2, count2 = 0;
    for (let i = vbox[dim1 as 'r1']; i <= vbox[dim2 as keyof VBox]; i++) {
      if (partialsum[i] > total / 2) {
        vbox1 = vbox.copy();
        vbox2 = vbox.copy();
        left = i - vbox[dim1 as 'r1'];
        right = vbox[dim2 as 'r1'] - i;
        if (left <= right)
          d2 = Math.min(vbox[dim2 as 'r1'] - 1, ~~(i + right / 2));
        else d2 = Math.max(vbox[dim1 as 'r1'], ~~(i - 1 - left / 2));
        // avoid 0-count boxes
        while (!partialsum[d2]) d2++;
        count2 = lookaheadsum[d2];
        while (!count2 && partialsum[d2 - 1]) count2 = lookaheadsum[--d2];
        // set dimensions
        vbox1[dim2 as 'r1'] = d2;
        vbox2[dim1 as 'r1'] = vbox1[dim2 as 'r1'] + 1;
        // console.log('vbox counts:', vbox.count(), vbox1.count(), vbox2.count());
        return [vbox1, vbox2];
      }
    }

  }
  // determine the cut planes
  return maxw === rw ? doCut('r') :
    maxw === gw ? doCut('g') :
      doCut('b');
}

function quantize(pixels: RGB[], maxcolors: number): CMap {
  // short-circuit
  if (!pixels.length) {
    throw new Error('no pixels');
  }
  if (maxcolors < 2 || maxcolors > 256) {
    throw new Error('wrong number of maxcolors');
  }

  // XXX: check color content and convert to grayscale if insufficient

  let histo = getHisto(pixels);

  // check that we aren't below maxcolors already
  let nColors = 2;
  histo.forEach(function () {
    nColors++
  });
  if (nColors <= maxcolors) {
    // XXX: generate the new colors from the histo and return
  }

  const pq = new PQueue<VBox>(function (a, b) {
    return naturalOrder(a.count(), b.count())
  });

  // get the beginning vbox from the colors
  let vbox = vboxFromPixels(pixels, histo);
  pq.push(vbox);

  // inner function to do the iteration

  function iter(lh: PQueue<VBox>, target: number) {
    let ncolors = 1,
      niters = 0,
      vbox;
    while (niters < maxIterations) {
      vbox = lh.pop() as VBox;
      if (!vbox.count()) { /* just put it back */
        lh.push(vbox);
        niters++;
        continue;
      }
      // do the cut
      let vboxes = medianCutApply(histo, vbox) as VBox[],
        vbox1 = vboxes[0],
        vbox2 = vboxes[1];

      if (!vbox1) {
        throw new Error("vbox1 not defined; shouldn't happen!");
      }
      lh.push(vbox1);
      if (vbox2) { /* vbox2 can be null */
        lh.push(vbox2);
        ncolors++;
      }
      if (ncolors >= target) return;
      if (niters++ > maxIterations) {
        throw new Error("infinite loop; perhaps too few pixels!");
      }
    }
  }

  // first set of colors, sorted by population
  iter(pq, fractByPopulations * maxcolors);

  // Re-sort by the product of pixel occupancy times the size in color space.
  let pq2 = new PQueue<VBox>(function (a, b) {
    return naturalOrder(a.count() * a.volume(), b.count() * b.volume())
  });
  while (pq.size()) {
    pq2.push(pq.pop() as VBox);
  }

  // next set - generate the median cuts using the (npix * vol) sorting.
  iter(pq2, maxcolors - pq2.size());

  // calculate the actual colors
  let cmap = new CMap();

  while (pq2.size()) {
    cmap.push(pq2.pop() as VBox);
  }

  return cmap;
}

export default quantize
