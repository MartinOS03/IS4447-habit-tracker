import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

type FormFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  secureTextEntry?: boolean;
  onChangeText: (text: string) => void;
};

export const FormField = ({
  label,
  placeholder,
  value,
  secureTextEntry,
  onChangeText,
}: FormFieldProps) => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholder={placeholder}
        value={value}
        secureTextEntry={secureTextEntry}
        onChangeText={onChangeText}
        style={styles.input}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
});
