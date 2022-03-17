import 'react-native-get-random-values';
import { CallInAppSession, CallInAppEvent, CallState } from '@callinapp/react-native';
import { ConnectionStatus, UserStatus } from './constants';
import {
  LOGIN,
  LOGOUT,
  UPDATE_CONNECTION_STATUS,
  UPDATE_USER_STATUS,
  NEW_CALL,
  TIME_ELAPSED, REMOTE_STREAM, JOIN_CONFERENCE, LEAVE_CONFERENCE, LOCAL_STREAM, UPDATE_CALL_STATE
} from './actions/actionTypes'
import store from '../store';
import cache from '../services/cache';

let _callInAppServiceInstance = null;
const _savedLoggedInUserKey = '_savedLoggedInUserKey';

export default class CallInAppService {
  _timer = null;

  static getInstance = () => {
    if (!_callInAppServiceInstance) {
      _callInAppServiceInstance = new CallInAppService();
    }

    return _callInAppServiceInstance;
  };

   async getUser() {
    // Get logged user from AsyncStorage
    const savedLoggedInUser = await cache.getItem(_savedLoggedInUserKey);
    this.user = savedLoggedInUser ? JSON.parse(savedLoggedInUser) : null;
    return this.user;
  }

  get isLoggedIn() {
     return this.client && this.client.isLoggedIn;
  }

  constructor() {
    this.activeCall = null;
    this.activeConference = null;

    this._setActiveCall = this._setActiveCall.bind(this);
    this._startTimer = this._startTimer.bind(this);
    this._stopTimer = this._stopTimer.bind(this);
  }

  login(options) {
    this.logout(true);
    this.client = new CallInAppSession(options);
    this.user = options;
    this._subscribeEvents();
    this.client.connect();
    store.dispatch({
      type: UPDATE_CONNECTION_STATUS,
      payload: {
        connectionStatus: ConnectionStatus.CONNECTING
      }
    })
  }

  logout(keepSession = false) {
    this.client && this.client.close(keepSession);

    // Remove saved user from cache
    cache.removeItem(_savedLoggedInUserKey);
    this.user = null;
    this._stopTimer();
  }

  _subscribeEvents() {
    this.client.on(CallInAppEvent.ON_READY, () => {
      console.log('[CallInAppService] Ready');
      store.dispatch({
        type: UPDATE_CONNECTION_STATUS,
        payload: {
          connectionStatus: ConnectionStatus.READY
        }
      })
    });

    this.client.on(CallInAppEvent.ON_CLOSED, () => {
      console.log('[CallInAppService] Closed');
      store.dispatch({
        type: LOGOUT
      });
    });

    this.client.on(CallInAppEvent.ON_ERROR, (err, data) => {
      console.log('[CallInAppService] Error', err);
      store.dispatch({
        type: UPDATE_CONNECTION_STATUS,
        payload: {
          connectionStatus: ConnectionStatus.ERROR
        }
      })
    });
    this.client.on(CallInAppEvent.ON_RETRYING, (err, data) => {
      console.log('[CallInAppService] Retrying');
      store.dispatch({
        type: UPDATE_CONNECTION_STATUS,
        payload: {
          connectionStatus: ConnectionStatus.RETRYING
        }
      })
    });
    this.client.on(CallInAppEvent.ON_LOGIN_ERROR, (err, data) => {
      console.log('[CallInAppService] Login Error');
      store.dispatch({
        type: UPDATE_USER_STATUS,
        payload: {
          userStatus: UserStatus.LOGIN_FAILED
        }
      })
    });
    this.client.on(CallInAppEvent.ON_LOGIN_SUCCESS, (err, data) => {
      console.log('[CallInAppService] Login Success', data);

      // Save to cache
      cache.setItem(_savedLoggedInUserKey, JSON.stringify(this.user));

      store.dispatch({
        type: LOGIN,
        payload: {
          user: this.user
        }
      })
    });
    this.client.on(CallInAppEvent.ON_SPEED_CHANGE, (err, data) => {
      console.log('[CallInAppService] Speed change', data);
    });

    this.client.on(CallInAppEvent.ON_USER_MEDIA_ERROR, (err) => {
      console.error('[CallInAppService] User Media', err);
    });

    this.client.on(CallInAppEvent.ON_USER_PEER_ERROR, (err) => {
      console.error('[CallInAppService] User Peer', err);
    });

    this.client.on(CallInAppEvent.ON_INCOMING_CALL, (err, call) => {
      console.log('[CallInAppService] Incoming call', call);
      let t = setTimeout(() => {
        this.answerCall(call);
        clearTimeout(t);
      }, 5000);
    });

    this.client.on(CallInAppEvent.ON_RECOVERY_CALL, (err, call) => {
      console.debug('[CallInAppService] Call need recovery', call);

      let t = setTimeout(() => {
        this.answerCall(call);
        clearTimeout(t);
      }, 5000);
    });

    this.client.on(CallInAppEvent.ON_CALL_LOCAL_STREAM, (err, call) => {
      console.debug('[CallInAppService] Call local stream', call);
      store.dispatch({
        type: LOCAL_STREAM,
        payload: {
          localStream: call.localStream
        }
      })
    });

    this.client.on(CallInAppEvent.ON_CALL_REMOTE_STREAM, (err, call) => {
      console.debug('[CallInAppService] Call remote stream', call);
      store.dispatch({
        type: REMOTE_STREAM,
        payload: {
          remoteStream: call.remoteStream
        }
      })
    });

    this.client.on(CallInAppEvent.ON_CONFERENCE_JOINED, (err, conference) => {
      console.debug('[CallInAppService] Conference joined', conference);
      this.activeConference = conference;
      store.dispatch({
        type: JOIN_CONFERENCE,
        payload: {
          conference: conference
        }
      })
    });

    this.client.on(CallInAppEvent.ON_CONFERENCE_LEFT, (err, conference) => {
      console.debug('[CallInAppService] Conference left', conference);
      this.activeConference = null;
      store.dispatch({
        type: LEAVE_CONFERENCE
      })
    });

    this.client.on(CallInAppEvent.ON_CONFERENCE_MEMBER_JOINED, (err, [conference, member]) => {
      console.debug('[CallInAppService] Conference member joined', conference, member);
    });

    this.client.on(CallInAppEvent.ON_CONFERENCE_MEMBER_LEFT, (err, [conference, member]) => {
      console.debug('[CallInAppService] Conference member left', conference, member);
    });

    this.client.on(CallInAppEvent.ON_CONFERENCE_MEMBER_UPDATED, (err, [conference, member]) => {
      console.debug('[CallInAppService] Conference member updated', conference, member);
    });

    this.client.on(CallInAppEvent.ON_CONFERENCE_MEMBER_CLEARED, (err, [conference, members]) => {
      console.debug('[CallInAppService] Conference member cleared', conference, members);
    });

    this.client.on(CallInAppEvent.ON_CONFERENCE_CHAT_MESSAGE, (err, [conference, message]) => {
      console.debug('[CallInAppService] Conference chat message', conference, message);
    });

    this.client.on(CallInAppEvent.ON_CALL_STATE_UPDATE, (err, call) => {
      console.debug('[App] Call state', call.state);
      if (this.activeCall && this.activeCall.id === call.id) {
        store.dispatch({
          type: UPDATE_CALL_STATE,
          payload: {
            callState: call.state
          }
        })
      }

      switch (call.state) {
        case CallState.TRYING:
          this._setActiveCall(call);
          break;
        case CallState.RINGING:
          break;
        case CallState.ACTIVE:
          this._setActiveCall(call);
          this._startTimer();
          break;
        case CallState.DESTROYED:
          if (this.activeCall && this.activeCall.id === call.id) {
            this._setActiveCall(null);
            this._stopTimer();
          }
          break;
        default:
          break;
      }
    });
  }

  _setActiveCall(call) {
    this.activeCall = call;
    store.dispatch({
      type: NEW_CALL,
      payload: {
        call: call
      }
    })
  }

  makeCall(destinationNumber) {
    const data = {
      destinationNumber
    };
    this.hangupCall();
    this.activeCall = this.client.newCall(data);
  }

  hangupCall() {
    if (this.activeCall) {
      this.activeCall.hangup()
    }
  }

  answerCall(call) {
    // Hangup the old call
    if (this.activeCall && call.id !== this.activeCall.id) {
      this.hangupCall();
    }

    call.answer();
  }

  _startTimer() {
    this._timer = setInterval(()=> {
      if (this.activeCall) {
        const elapsedSeconds = Math.round((Date.now() - this.activeCall.activeTime)/1000);
        store.dispatch({
          type: TIME_ELAPSED,
          payload: {
            timeElapsed: elapsedSeconds
          }
        })
      }
    }, 1000);
  }

  _stopTimer() {
    this._timer && clearInterval(this._timer);
  }
}
