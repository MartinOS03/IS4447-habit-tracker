import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { HabitsScreen } from '../src/screens/app/HabitsScreen';

jest.mock('../src/db/queries', () => ({
  getHabitList: jest.fn().mockResolvedValue([
    {
      id: 1,
      name: 'Morning Walk',
      description: 'Walk for at least 20 minutes',
      categoryName: 'Health',
      categoryColor: '#22C55E',
    },
  ]),
  getCategoryList: jest.fn().mockResolvedValue([{ id: 1, name: 'Health' }]),
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (callback: () => void) => callback(),
}));

describe('HabitsScreen integration', () => {
  it('shows seeded habit data after load', async () => {
    const { getByText } = render(<HabitsScreen />);
    await waitFor(() => {
      expect(getByText('Morning Walk')).toBeTruthy();
      expect(getByText('Health')).toBeTruthy();
    });
  });
});
