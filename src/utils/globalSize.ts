import { Dimensions, Platform } from 'react-native';

const size = Platform.OS === 'web' 
  ? { width: 360, height: 800 }
  : Dimensions.get('window');

export const GLOBAL_SIZE = {
  width: size.width,
  height: size.height,
};
