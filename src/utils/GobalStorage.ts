import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

const saveItem = async (key: string, value: string) => {
    if (isWeb) {
        localStorage.setItem(key, value);
    } else {
        await AsyncStorage.setItem(key, value);
    }
};

const getItem = async (key: string) => {
    if (isWeb) {
        return localStorage.getItem(key);
    } else {
        return await AsyncStorage.getItem(key);
    }
};

const removeItem = async (key: string) => {
    if (isWeb) {
        localStorage.removeItem(key);
    } else {
        await AsyncStorage.removeItem(key);
    }
};

export default{ getItem, removeItem, saveItem };

