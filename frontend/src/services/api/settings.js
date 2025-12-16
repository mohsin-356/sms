import { http } from '../http';

// Generic settings API helpers
export const get = async (key) => {
  const { data } = await http.get(`/settings/${encodeURIComponent(key)}`);
  return data; // { key, value, updatedAt }
};

export const set = async (key, value) => {
  const payload = { value: typeof value === 'string' ? value : JSON.stringify(value) };
  const { data } = await http.put(`/settings/${encodeURIComponent(key)}`, payload);
  return data;
};

// Convenience methods for school profile
const PROFILE_KEY = 'school.profile';

export const getSchoolProfile = async () => {
  try {
    const item = await get(PROFILE_KEY);
    if (!item || item.value == null) return null;
    try {
      return JSON.parse(item.value);
    } catch {
      return { raw: String(item.value) };
    }
  } catch (_) {
    return null;
  }
};

export const saveSchoolProfile = async (profile) => {
  return set(PROFILE_KEY, profile);
};
