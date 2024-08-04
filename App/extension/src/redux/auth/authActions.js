export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGOUT = 'LOGOUT';

export const loginSuccess = (accessToken) => ({
  type: LOGIN_SUCCESS,
  payload: { accessToken },
});

export const logout = () => ({
  type: LOGOUT,
});
