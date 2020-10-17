import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useCallback, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Provider } from 'react-redux';
import store from './store';
import CallInAppService from './call-in-app/CallInAppService';
import { useSelector } from 'react-redux';
import Login from './Login';
import Dialpad from './Dialpad';
import InCall from './InCall';

const cia = CallInAppService.getInstance();


const App = () => {

  const [user, setUser] = useState(null);
  const ciaUser = useSelector(state => state.user || {});
  const ciaCall = useSelector(state => state.call || {});

  const login = useCallback((user) => {
    cia.login(user);
    console.log('Login as', user);
  }, []);

  const logout = useCallback(() => {
    cia.logout();
  }, []);

  const handleLogin = (user) => {
    login(user);
  };

  const handleMakeCall = (destinationNumber) => {
    cia.makeCall(destinationNumber);
  };

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    // Ignore if user has logged in
    if (cia.isLoggedIn) {
      console.log('User has logged in');
      return;
    }

    const loginSavedUser = async () => {
      const savedUser = await cia.getUser();
      if (savedUser) {
        login(savedUser);
        setUser(savedUser);
      }
    };

    loginSavedUser();
  }, [login]);

  return (
    <View style={styles.container}>
      { !ciaUser.user ? <Login handleLogin={handleLogin} user={user} /> : null }
      { ciaUser.user ? (<TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
        <Text style={styles.logOutText}>Logout</Text>
      </TouchableOpacity>) : null }
      { (ciaUser.user && !ciaCall.call) ? <Dialpad handleMakeCall={handleMakeCall} /> : null }
      { ciaCall.call ? <InCall call={ciaCall.call} /> : null }

      <StatusBar style="auto" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  logoutBtn: {
    backgroundColor: 'red',
    alignItems: 'center',
    paddingVertical: 5,
    margin: 10,
    marginTop: 40,
    alignSelf: 'flex-end',
    width: 100
  },
  logOutText: {
    color: 'white',
  }
});

export default function () {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  )
}