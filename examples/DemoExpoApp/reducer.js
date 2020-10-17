import callReducer from './call-in-app/reducers/callReducer';
import userReducer from './call-in-app/reducers/userReducer';
import { combineReducers } from 'redux';

const combinedReducer = combineReducers({
  call: callReducer,
  user: userReducer
});
export default combinedReducer;
