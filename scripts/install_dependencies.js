const execa = require('execa');
const Listr = require('listr');

const { INIT_CWD, PWD } = process.env

console.log('-> Checking CWD', INIT_CWD, PWD);

if (!INIT_CWD || INIT_CWD === PWD) {
  console.log('-> Dependencies will only installed in the main app dir.')
} else {
  const installDependencies = async () => {
    const tasks = [
      {
        title: 'Installing react-native-webrtc...',
        task: async () => {
          await execa('npm', [ 'install', 'react-native-webrtc' ], { cwd: INIT_CWD })
        },
      },
      {
        title: 'Installing @react-native-community/async-storage...',
        task: async () => {
          await execa('npm', [ 'install', '@react-native-community/async-storage' ], { cwd: INIT_CWD })
        },
      },
      {
        title: 'Installing react-native-incall-manager...',
        task: async () => {
          await execa('npm', [ 'install', 'react-native-incall-manager' ], { cwd: INIT_CWD })
        },
      },
    ]

    return await new Listr(tasks)
      .run();
  }

  // Install dependencies
  installDependencies()
    .then(r => console.log('-> Dependencies installed successfully!'))
    .catch(e => console.error(e.message));
}
