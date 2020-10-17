import {
  CLEAR_CONFERENCE_MEMBER,
  END_CALL,
  INCOMING_CALL, JOIN_CONFERENCE, JOIN_CONFERENCE_MEMBER, LEAVE_CONFERENCE, LEAVE_CONFERENCE_MEMBER,
  LOCAL_STREAM, LOGOUT,
  NEW_CALL,
  REMOTE_STREAM,
  TIME_ELAPSED,
  UPDATE_CALL_STATE, UPDATE_CONFERENCE_MEMBER
} from '../actions/actionTypes';

const defaultState = {
  timeElapsed: null,
  call: null,
  incomingCall: null,
  callState: null,
  localStream: null,
  remoteStream: null,
  conference: null,
  conferenceMembers: []
};
export default (state = defaultState, action) => {
  switch (action.type) {
    case TIME_ELAPSED: {
      return {
        ...state,
        timeElapsed: action.payload.timeElapsed
      }
    }
    case INCOMING_CALL: {
      return {
        ...state,
        incomingCall: action.payload.incomingCall
      }
    }
    case NEW_CALL: {
      return {
        ...state,
        call: action.payload.call
      }
    }
    case END_CALL: {
      return {
        ...state,
        call: null
      }
    }
    case LOCAL_STREAM: {
      return {
        ...state,
        localStream: action.payload.localStream
      }
    }
    case REMOTE_STREAM: {
      return {
        ...state,
        remoteStream: action.payload.remoteStream
      }
    }
    case UPDATE_CALL_STATE: {
      return {
        ...state,
        callState: action.payload.callState
      }
    }
    case JOIN_CONFERENCE: {
      return {
        ...state,
        conference: action.payload.conference
      }
    }
    case LEAVE_CONFERENCE: {
      return {
        ...state,
        conference: null,
        conferenceMembers: []
      }
    }
    case JOIN_CONFERENCE_MEMBER: {
      return {
        ...state,
        conferenceMembers: action.payload.members
      }
    }
    case LEAVE_CONFERENCE_MEMBER: {
      return {
        ...state,
        conferenceMembers: action.payload.members
      }
    }
    case UPDATE_CONFERENCE_MEMBER: {
      return {
        ...state,
        conferenceMembers: []
      }
    }
    case CLEAR_CONFERENCE_MEMBER: {
      return {
        ...state,
        conferenceMembers: []
      }
    }
    case LOGOUT: {
      return defaultState;
    }
    default:
      return state;

  }
}
