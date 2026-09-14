export function normalizeText(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function matchesSearch(value, searchTerm) {
  return normalizeText(value).includes(normalizeText(searchTerm));
}
