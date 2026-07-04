import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

export interface PngImage {
  width: number;
  height: number;
  data: Uint8Array;
}

const PNG_SIGNATURE = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]);

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c >>> 0;
}

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (const byte of bytes) {
    c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, payload: Uint8Array): Buffer {
  const typeBytes = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBytes, payload]);
  const output = Buffer.allocUnsafe(12 + payload.length);
  output.writeUInt32BE(payload.length, 0);
  typeBytes.copy(output, 4);
  Buffer.from(payload).copy(output, 8);
  output.writeUInt32BE(crc32(body), 8 + payload.length);
  return output;
}

function makeHeader(width: number, height: number): Uint8Array {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // bit depth
  header[9] = 6; // RGBA
  header[10] = 0; // deflate
  header[11] = 0; // adaptive filtering
  header[12] = 0; // no interlace
  return header;
}

function addScanlineFilters(image: PngImage): Uint8Array {
  const { width, height, data } = image;
  const stride = width * 4;
  if (data.length !== stride * height) {
    throw new Error(`RGBA buffer length ${data.length} does not match ${width}x${height}`);
  }

  const filtered = new Uint8Array((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const sourceOffset = y * stride;
    const targetOffset = y * (stride + 1);
    filtered[targetOffset] = 0;
    filtered.set(data.subarray(sourceOffset, sourceOffset + stride), targetOffset + 1);
  }
  return filtered;
}

export function encodePng(image: PngImage): Buffer {
  if (!Number.isInteger(image.width) || !Number.isInteger(image.height)) {
    throw new Error('PNG dimensions must be integers');
  }
  if (image.width <= 0 || image.height <= 0) {
    throw new Error('PNG dimensions must be positive');
  }

  return Buffer.concat([
    Buffer.from(PNG_SIGNATURE),
    chunk('IHDR', makeHeader(image.width, image.height)),
    chunk('IDAT', deflateSync(addScanlineFilters(image), { level: 9 })),
    chunk('IEND', new Uint8Array()),
  ]);
}

export function writePng(path: string, image: PngImage): void {
  writeFileSync(path, encodePng(image));
}
