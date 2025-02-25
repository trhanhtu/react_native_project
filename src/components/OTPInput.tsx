import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { StyleProp, StyleSheet, TextInput, View, ViewStyle } from 'react-native';

interface OTPInputProps {
  style?: StyleProp<ViewStyle>;
  length: number; // Number of OTP digits
}

export interface OTPInputRef {
  clear: () => void;
  getValue: () => string;
}

const OTPInput = forwardRef<OTPInputRef, OTPInputProps>(({ length, style }, ref) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputs = useRef<TextInput[]>([]);

  useImperativeHandle(ref, () => ({
    clear: () => setOtp(Array(length).fill('')),
    getValue: () => otp.join(''),
  }));

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text.length === 1 && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (text: string, index: number) => {
    if (text === '' && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={[styles.container, style]}>
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          style={styles.input}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === 'Backspace') {
              handleBackspace(digit, index);
            }
          }}
          keyboardType="numeric"
          maxLength={1}
          ref={(ref) => (inputs.current[index] = ref!)}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  input: {
    width: 40,
    height: 40,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    textAlign: 'center',
    borderRadius: 5,
  },
});

export default OTPInput;
