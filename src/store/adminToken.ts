export function storeAdminToken(token: string) {
  localStorage.setItem('adminToken', token);
}

export function getAdminPermissions(): Record<string, unknown> {
  try {
    const raw = localStorage.getItem('adminPermissions');
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function hasAdminPermission(key: string): boolean {
  const value = getAdminPermissions()[key];
  if (value === true || value === 1) return true;
  return String(value ?? '')
    .trim()
    .toLowerCase() === 'true';
}

export function getAdminToken() {
  return localStorage.getItem('adminToken');
}

export function removeAdminToken() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminPermissions');
}
