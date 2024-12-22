export function storeTokenInLocalStorage(token:string) {
  localStorage.setItem('token', token);
}

export function getTokenFromLocalStorage() {
  return localStorage.getItem('token');
}
export function removeTokenFromLocalStorage() {
  localStorage.removeItem('token');
}