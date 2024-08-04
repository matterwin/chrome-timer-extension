import { LOGIN_SUCCESS, LOGOUT } from './authActions';

const initialState = {
  isAuthenticated: false,
  accessToken: null,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        accessToken: action.payload.accessToken
      };
    case LOGOUT:
      // logout();
      return {
        ...state,
        isAuthenticated: false,
        accessToken: null,
      };
    default:
      return state;
  }
};

export default authReducer;
