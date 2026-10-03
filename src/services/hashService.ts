/**
 * Utility to calculate SHA-256 hash for forensic traceability of evidence files
 */
export async function calculateSha256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export function generateMockSha256(seedText: string): string {
  let hash = 0;
  for (let i = 0; i < seedText.length; i++) {
    const char = seedText.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex}49afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.substring(0, 64);
}
