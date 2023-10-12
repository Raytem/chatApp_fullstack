export function getToken() {
  return localStorage.getItem('accessToken');
}

export function setToken(accessToken: string) {
  localStorage.setItem('accessToken', accessToken);
}

export function clearToken() {
  localStorage.removeItem('accessToken');
}
