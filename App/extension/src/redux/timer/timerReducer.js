import { SET_USER_DATA } from './userActions';

const initialState = {
  countOrientation: ''
};

const timerReducer = (state = initialState, action) => {
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

export default timerReducer;
