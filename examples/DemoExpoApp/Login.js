import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Button } from 'react-native';

export default function Login(props) {
  const { handleLogin, user } = props;

  const [wssUrl, setWssUrl] = useState(user ? user.wssUrl : '');
  const [extension, setExtension] = useState(user ? user.extension : '');
  const [domain, setDomain] = useState(user ? user.domain : '');
  const [password, setPassword] = useState(user ? user.password: '');
  const [callerIdName, setCallerIdName] = useState((user && user.callOptions) ? user.callOptions.callerIdName : '');
  const [callerIdNumber, setCallerIdNumber] = useState((user && user.callOptions) ? user.callOptions.callerIdNumber: '');
  const [email, setEmail] = useState((user && user.userInfo) ? user.userInfo.email : '');

  const onSubmit = (evt => {
    const user = {
      wssUrl,
      extension,
      domain,
      password,
      callOptions: {
        callerIdName,
        callerIdNumber,
      },
      userInfo: {
        email
      }
    };

    handleLogin(user);
  });

  return (<View style={styles.login}>
    <TextInput
      style={styles.textInput}
      onChangeText={text => setWssUrl(text)}
      value={wssUrl}
      placeholder={'wss://server.com:8082'}
      autoCorrect={false}
      autoCapitalize={'none'}
    />

    <TextInput
      keyboardType={'numeric'}
      style={styles.textInput}
      onChangeText={text => setExtension(text)}
      value={extension}
      placeholder={'111'}
    />

    <TextInput
      style={styles.textInput}
      onChangeText={text => setDomain(text)}
      value={domain}
      placeholder={'domain.com'}
      autoCorrect={false}
      autoCapitalize={'none'}
    />

    <TextInput
      secureTextEntry={true}
      style={styles.textInput}
      onChangeText={text => setPassword(text)}
      value={password}
      placeholder={'Password'}
    />

    <TextInput
      style={styles.textInput}
      onChangeText={text => setCallerIdName(text)}
      value={callerIdName}
      placeholder={'Caller Id Name'}
      autoCorrect={false}
      autoCapitalize={'none'}
    />

    <TextInput
      keyboardType={'numeric'}
      style={styles.textInput}
      onChangeText={text => setCallerIdNumber(text)}
      value={callerIdNumber}
      placeholder={'Caller Id Number'}
    />

    <TextInput
      keyboardType={'email-address'}
      style={styles.textInput}
      onChangeText={text => setEmail(text)}
      value={email}
      placeholder={'Email'}
      autoCorrect={false}
      autoCapitalize={'none'}
    />

    <Button
      style={styles.loginBtn}
      title="Login"
      onPress={onSubmit}
    />
  </View>);
};

const styles = StyleSheet.create({
  login: {
    justifyContent: 'center',
    paddingHorizontal: 10
  },
  textInput: {
    borderColor: 'gray',
    borderWidth: 1,
    margin: 10
  },
  loginBtn: {
    marginHorizontal: 20
  }
});
