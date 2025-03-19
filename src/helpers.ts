export function noop() {}

export function splitChunks(file: Blob, chunkSize: number) {
  const chunks: [number, number][] = [];

  let currentSize = 0;
  while (currentSize < file.size) {
    const end = currentSize + chunkSize;
    chunks.push([currentSize, end < file.size ? end : file.size]);
    currentSize += chunkSize;
  }

  return chunks;
}
