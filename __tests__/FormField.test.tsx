import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { FormField } from '../src/components/FormField';

describe('FormField', () => {
  it('renders label and placeholder, then fires onChangeText', () => {
    const onChangeText = jest.fn();
    const { getByLabelText, getByPlaceholderText } = render(
      <FormField
        label="Habit Name"
        placeholder="Enter habit"
        value=""
        onChangeText={onChangeText}
      />,
    );

    expect(getByLabelText('Habit Name')).toBeTruthy();
    const input = getByPlaceholderText('Enter habit');
    fireEvent.changeText(input, 'Meditation');
    expect(onChangeText).toHaveBeenCalledWith('Meditation');
  });
});
