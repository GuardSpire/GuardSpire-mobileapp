import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

// ✅ Main app registration
AppRegistry.registerComponent(appName, () => App);
