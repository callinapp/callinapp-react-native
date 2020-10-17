import React from 'react';
import { RTCView } from 'react-native-webrtc';

export default ({ stream }) => {
  return (<RTCView style={{ flex: 1, alignItems: 'stretch' }} streamURL={stream ? stream.toURL() : ''}/>)
}