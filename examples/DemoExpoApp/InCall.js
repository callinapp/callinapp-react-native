import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, TextInput, Text, Button } from 'react-native';
import { useSelector } from 'react-redux';
import Video  from './Video';

export default function InCall(props) {
  const { call } = props;
  const { localStream, remoteStream, timeElapsed, conference } = useSelector(state => state.call);
  const [ dtmfDigits, setDtmfDigits ] = useState('');
  const [ message, setMessage ] = useState('');

  const onHangup = () => {
    call && call.hangup();
  };

  const onToggleMuteMic = () => {
    if (call) {
      let micMuted = call.toggleMuteMic();
      console.log('Mic muted:', micMuted);
    }
  };

  const onToggleMuteCam = () => {
    if (call) {
      let camMuted = call.toggleMuteCam();
      console.log('Cam muted:', camMuted);
    }
  };

  const onSwitchCamera = () => {
    if (call) {
      call.switchCamera();
    }
  };

  const onToggleSpeaker = () => {
    if (call) {
      call.toggleSpeaker();
    }
  };

  const onToggleHold = () => {
    if (call) {
      call.toggleHold();
    }
  };

  const sendDtmf = () => {
    if (call && dtmfDigits) {
      call.sendDtmf(dtmfDigits);
    }
  };

  const sendMessage = () => {
    if (conference && message) {
      conference.sendChat(message);
    }
  };

  return (<View style={styles.inCallContainer}>
    <View style={styles.inlineButtonContainer}>
      <Button
        title="Switch Camera"
        onPress={onSwitchCamera}
      />
      <Button
        title="Toggle Speaker"
        onPress={onToggleSpeaker}
      />
    </View>
    <View style={styles.videoContainer}>
      { !conference ? <Video style={styles.video} stream={localStream}/> : null }
      { remoteStream ? <Video style={styles.video} stream={remoteStream} /> : null }
    </View>

    <View style={styles.chatContainer}>
      <TextInput
        style={styles.textInput}
        onChangeText={text => setMessage(text)}
        value={message}
        placeholder={'Message here'}
      />
      <Button
        title="Send Message"
        onPress={sendMessage}
      />
    </View>
    <View style={styles.dtmfContainer}>
      <TextInput
        keyboardType={'phone-pad'}
        style={styles.textInput}
        onChangeText={text => setDtmfDigits(text)}
        value={dtmfDigits}
        placeholder={'DTMF digits here'}
      />
      <Button
        title="Send DTMF"
        onPress={sendDtmf}
      />
    </View>

    <View style={styles.buttonContainer}>
      <View style={styles.inlineButtonContainer}>
        <Button
          title="Toggle Mic"
          onPress={onToggleMuteMic}
        />
        <Button
          title="Toggle Camera"
          onPress={onToggleMuteCam}
        />
        <Button
          title="Toggle Hold"
          onPress={onToggleHold}
        />
      </View>
      <Button
        color="red"
        title={ `Hangup (${timeElapsed ? (timeElapsed + 's') : ''})` }
        onPress={onHangup}
      />
    </View>
  </View>);
};

const styles = StyleSheet.create({
  inCallContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  videoContainer: {
    flex: 1
  },
  video: {
    flex: 1,
    alignItems: 'stretch'
  },
  buttonContainer: {
    margin: 10
  },
  inlineButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10
  },
  dtmfContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginHorizontal: 10
  },
  chatContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginHorizontal: 10
  }
});
