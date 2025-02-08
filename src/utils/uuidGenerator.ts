export default function generateUUID(): string {
  function getRandomHexSegment(length: number): string {
    return Array.from({ length }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
  }

  // Generate the different parts of the UUID
  const segment1 = getRandomHexSegment(8);
  const segment2 = getRandomHexSegment(4);
  const segment3 = `4${getRandomHexSegment(3)}`; // UUID version 4
  const segment4 = `${(8 + Math.floor(Math.random() * 4)).toString(
    16
  )}${getRandomHexSegment(3)}`; // Variant 1
  const segment5 = getRandomHexSegment(12);

  return `${segment1}-${segment2}-${segment3}-${segment4}-${segment5}`;
}
