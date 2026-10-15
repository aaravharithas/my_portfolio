const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = (value) => typeof value === 'string' ? value.trim() : '';
const list = (value) => Array.isArray(value) ? value.filter(record) : [];

export function safeUrl(value) {
  try {
    const url = new URL(text(value));
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
}
function date(value) {
  const cleaned = text(value);
  return cleaned === 'Present' || (cleaned && Number.isFinite(Date.parse(cleaned))) ? cleaned : '';
}
function identity(item) {
  return typeof item.id === 'number' || typeof item.id === 'string' ? { id: item.id } : {};
}

// Only validated fields cross the API boundary. Missing optional data stays empty.
export function normalizePortfolio(data) {
  if (!record(data) || !text(data.name)) throw new Error('Portfolio name is required');
  for (const key of ['skills', 'projects', 'education', 'experience']) {
    if (data[key] != null && !Array.isArray(data[key])) throw new Error(`Invalid ${key} collection`);
  }
  const result = Object.fromEntries(['name', 'firstName', 'lastName', 'title', 'address', 'tagline', 'description', 'bio', 'aboutMe'].map(key => [key, text(data[key])]));
  result.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text(data.email)) ? text(data.email) : '';
  result.profileImage = safeUrl(data.profileImage);
  result.cvLink = safeUrl(data.cvLink);
  result.social = {};
  for (const key of ['linkedin', 'github', 'instagram', 'twitter']) {
    const url = safeUrl(data.social?.[key]);
    // A network homepage is a placeholder, not a profile.
    if (url && new URL(url).pathname.replaceAll('/', '')) result.social[key] = url;
  }
  result.skills = list(data.skills).filter(item => text(item.name)).map(item => ({ ...identity(item), name: text(item.name), category: text(item.category) }));
  result.projects = list(data.projects).filter(item => text(item.title) && item.status !== 'draft').map(item => ({
    ...identity(item), title: text(item.title), description: text(item.description),
    image: safeUrl(item.image), imageAlt: text(item.imageAlt) || text(item.title),
    imageFit: item.imageFit === 'cover' ? 'cover' : 'contain',
    imageWidth: Number.isInteger(item.imageWidth) && item.imageWidth > 0 && item.imageWidth <= 10000 ? item.imageWidth : 640,
    imageHeight: Number.isInteger(item.imageHeight) && item.imageHeight > 0 && item.imageHeight <= 10000 ? item.imageHeight : 400,
    link: safeUrl(item.link), github: safeUrl(item.github),
    tech_stack: Array.isArray(item.tech_stack) ? item.tech_stack.map(text).filter(Boolean) : [],
  }));
  for (const key of ['education', 'experience']) {
    const titleKey = key === 'education' ? 'degree' : 'role';
    result[key] = list(data[key]).filter(item => text(item[titleKey])).map(item => ({
      ...identity(item), ...Object.fromEntries(['degree', 'role', 'institution', 'company', 'location', 'description'].map(field => [field, text(item[field])])),
      startDate: date(item.startDate), endDate: date(item.endDate),
    }));
  }
  return result;
}

const CACHE_VERSION = 1;
export const portfolioCacheKey = (source) => `portfolio-content:${source}`;
export function readPortfolioCache(storage, source, now = Date.now()) {
  try {
    const saved = JSON.parse(storage.getItem(portfolioCacheKey(source)));
    if (saved?.version !== CACHE_VERSION || !Number.isFinite(saved.fetchedAt) || saved.fetchedAt <= 0 || saved.fetchedAt > now) return null;
    return { data: normalizePortfolio(saved.data), fetchedAt: saved.fetchedAt };
  } catch { return null; }
}
export function savePortfolioCache(storage, source, data, fetchedAt = Date.now()) {
  try {
    storage.setItem(portfolioCacheKey(source), JSON.stringify({ version: CACHE_VERSION, fetchedAt, data: normalizePortfolio(data) }));
  } catch { /* Storage limits or restrictions never prevent rendering. */ }
}
