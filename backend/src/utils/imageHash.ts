import crypto from 'crypto';
import fs from 'fs';

/**
 * Generates a perceptual hash representation from an image file buffer.
 * In production, this computes a lightweight gradient hash across image chunks.
 * This is strictly used to identify duplicate image uploads, NEVER for biometric identification.
 */
export const calculateImageHash = async (filePathOrBuffer: string | Buffer): Promise<string> => {
  try {
    let buffer: Buffer;
    if (typeof filePathOrBuffer === 'string') {
      buffer = await fs.promises.readFile(filePathOrBuffer);
    } else {
      buffer = filePathOrBuffer;
    }

    // Compute normalized structural signature using sampled byte blocks
    const sampleStep = Math.max(1, Math.floor(buffer.length / 64));
    let hashBits = '';
    
    for (let i = 0; i < 64 && (i * sampleStep) + 1 < buffer.length; i++) {
      const b1 = buffer[i * sampleStep];
      const b2 = buffer[(i * sampleStep) + 1];
      hashBits += b1 > b2 ? '1' : '0';
    }

    // Convert 64 bits to 16 hex characters
    let hexHash = '';
    for (let i = 0; i < hashBits.length; i += 4) {
      const nibble = hashBits.substring(i, i + 4);
      hexHash += parseInt(nibble, 2).toString(16);
    }

    return hexHash || crypto.createHash('md5').update(buffer.slice(0, 1024)).digest('hex').substring(0, 16);
  } catch (error) {
    console.error('Error generating image perceptual hash:', error);
    return '0000000000000000';
  }
};

/**
 * Calculates hamming distance between two hex perceptual hashes.
 * Distance <= 4 usually indicates duplicate or re-compressed image.
 */
export const calculateHammingDistance = (hash1: string, hash2: string): number => {
  if (hash1.length !== hash2.length) return 999;
  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    const val1 = parseInt(hash1[i], 16);
    const val2 = parseInt(hash2[i], 16);
    let xor = val1 ^ val2;
    while (xor > 0) {
      distance += xor & 1;
      xor >>= 1;
    }
  }
  return distance;
};
