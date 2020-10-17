import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Button } from 'react-native';

export default function Dialpad(props) {
  const [destinationNumber, setDestinationNumber] = useState('');
  const { handleMakeCall } = props;

  const onMakeCall = () => {
    if (destinationNumber) {
      handleMakeCall(destinationNumber)
    }
  };

  return (<View style={styles.dialpad}>
    <TextInput
      keyboardType={'phone-pad'}
      style={styles.textInput}
      onChangeText={text => setDestinationNumber(text)}
      value={destinationNumber}
      placeholder={'111 or +1023456789'}
    />
    <Button
      title="Call"
      onPress={onMakeCall}
    />
  </View>);
};

const styles = StyleSheet.create({
  dialpad: {
    justifyContent: 'center',
    paddingHorizontal: 10
  },
  textInput: {
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10
  },
})
