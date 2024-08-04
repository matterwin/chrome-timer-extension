import { SET_USER_DATA } from './userActions';
import { LOGOUT } from '../auth/authActions';

const initialState = {
  email: ''
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER_DATA:
      return {
        ...state,
        ...action.payload,
      };
    case LOGOUT:
      return initialState;
    default:
      return state;
  }
};

export default userReducer;
