export function parseDateToTimestamp(value) {
  if (!value) return Number.MAX_SAFE_INTEGER;
  const str = String(value).trim();

  let m = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime();

  m = str.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])).getTime();

  m = str.match(/^(\d{2})-(\d{2})-(\d{4})/);
  if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])).getTime();

  return Number.MAX_SAFE_INTEGER;
}

export function sortAcoesByData(acoes) {
  return [...(acoes || [])].sort(
    (a, b) => parseDateToTimestamp(a.data) - parseDateToTimestamp(b.data)
  );
}
