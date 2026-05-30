export function storeAdminToken(token: string) {
  localStorage.setItem('adminToken', token);
}

export function getAdminToken() {
  return localStorage.getItem('adminToken');
}

export function removeAdminToken() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminPermissions');
}
