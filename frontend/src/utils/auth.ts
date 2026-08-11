export const getToken = () => localStorage.getItem('token');

export const getUserRole = () => {
  const token = getToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
  } catch (e) {
    return null;
  }
};

export const isAuthenticated = () => {
  return !!getToken();
};
