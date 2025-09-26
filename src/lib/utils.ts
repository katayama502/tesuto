export function formatCurrency(value: number) {
  return `¥${value.toLocaleString('ja-JP')}`;
}

export function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

export function tagsToLabel(tags: string[]) {
  return tags.map((tag) => tag).join('/');
}
