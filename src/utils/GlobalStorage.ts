import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

const setItem = (key: string, value: any) => {
    if (isWeb) {
        localStorage.setItem(key, value);
    } else {
        SecureStore.setItem(key, value);
    }
};

const getItem = (key: string) => {
    if (isWeb) {
        return localStorage.getItem(key);
    } else {
        return SecureStore.getItem(key);
    }
};

const removeItem = async (key: string) => {
    if (isWeb) {
        localStorage.removeItem(key);
    } else {
        await SecureStore.deleteItemAsync(key)
    }
};

export default { getItem, removeItem, setItem };

