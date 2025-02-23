import { StyleSheet } from 'react-native';

const CustomStyles = StyleSheet.create({
    shadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5, // Required for Android
    },
});

export default CustomStyles;
