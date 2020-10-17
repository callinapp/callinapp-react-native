
### Android
To start the android example, we need to create a `debug.keystore` file
into the directory `android/app`:

`keytool -genkey -v -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000`

- `npm start`
- `npm run android`

### iOS

To run the ios example, we firstly install natives dependencies and build ios workspace:
- `pod install`
- `npm start`
- `npm run ios`