export function getTagColor(tag: string) {
  const colors = [
    'var(--accent-pink)',
    'var(--accent-purple)',
    'var(--tag-green)',
    'var(--tag-blue)',
    'var(--tag-yellow)',
    'var(--tag-purple)',
    'var(--tag-cyan)',
    'var(--tag-orange)',
  ];
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = Math.imul(31, hash) + tag.charCodeAt(i) | 0;
  }
  return colors[Math.abs(hash) % colors.length];
}
