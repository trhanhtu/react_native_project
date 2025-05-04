import { StyleSheet } from 'react-native';

const CustomStyles = StyleSheet.create({
    shadow: {
        boxShadow: '0px 4px 5px rgba(0, 0, 0, 0.3)', // Modern shadow syntax
        elevation: 5, // Ensure Android compatibility
    },
});

export default CustomStyles;
