export function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}
