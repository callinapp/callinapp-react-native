import { UserStatus, ConnectionStatus } from '../constants';
import {
  LOGIN,
  LOGOUT,
  UPDATE_USER_STATUS,
  UPDATE_CONNECTION_STATUS
} from '../actions/actionTypes';

const defaultState = {
  connectionStatus: ConnectionStatus.DISCONNECTED,
  userStatus: UserStatus.NOT_LOGIN,
  user: null,
  latestUser: null,
};
export default (state = defaultState, action) => {
  switch (action.type) {
    case LOGIN: {
      return {
        ...state,
        userStatus: UserStatus.LOGGED_IN,
        user: action.payload.user
      }
    }
    case LOGOUT: {
      return {
        ...state,
        userStatus: UserStatus.LOGGED_OUT,
        user: null,
        latestUser: state.user,
        connectionStatus: ConnectionStatus.DISCONNECTED,
      }
    }
    case UPDATE_CONNECTION_STATUS:
      return {
        ...state,
        connectionStatus: action.payload.connectionStatus
      };
    case UPDATE_USER_STATUS:
      return {
        ...state,
        userStatus: action.payload.userStatus
      };
    default:
      return state;
  }
}
