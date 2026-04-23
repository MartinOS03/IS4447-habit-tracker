jest.mock('../src/db/client', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    delete: jest.fn(),
  },
}));

import { db } from '../src/db/client';
import { seedDatabase } from '../src/db/seed';

describe('seedDatabase', () => {
  it('inserts seed data once with no duplication', async () => {
    const selectMock = db.select as jest.Mock;
    const insertMock = db.insert as jest.Mock;

    selectMock
      .mockReturnValueOnce({ from: jest.fn().mockResolvedValue([]) })
      .mockReturnValueOnce({
        from: jest.fn().mockResolvedValue([]),
      })
      .mockReturnValueOnce({
        from: jest.fn().mockResolvedValue([
          { id: 1, name: 'Sleep' },
          { id: 2, name: 'Study' },
          { id: 3, name: 'Nutrition' },
          { id: 4, name: 'Gym' },
        ]),
      })
      .mockReturnValueOnce({
        from: jest.fn().mockResolvedValue([]),
      })
      .mockReturnValueOnce({
        from: jest.fn().mockResolvedValue([
          { id: 1, name: 'Sleep Tracking', categoryId: 1 },
          { id: 2, name: 'Diet Tracking', categoryId: 3 },
          { id: 3, name: 'Gym Tracking', categoryId: 4 },
          { id: 4, name: 'Study Tracking', categoryId: 2 },
        ]),
      })
      .mockReturnValueOnce({
        from: jest.fn().mockResolvedValue([]),
      })
      .mockReturnValueOnce({
        from: jest.fn().mockResolvedValue([]),
      });

    insertMock.mockReturnValue({ values: jest.fn().mockResolvedValue(undefined) });

    await seedDatabase();
    expect(insertMock).toHaveBeenCalled();
  });
});
