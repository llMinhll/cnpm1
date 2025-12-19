export function requireLogin() {
  const token = localStorage.getItem("bus_token");
  if (!token) {
    window.location.href = "/login";
  }
}

export function logout() {
  localStorage.removeItem("bus_token");

  // reload + quay về login
  window.location.href = "/login";
}
