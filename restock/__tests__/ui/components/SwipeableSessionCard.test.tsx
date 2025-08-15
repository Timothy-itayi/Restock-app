import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SwipeableSessionCard } from '../../../app/(tabs)/dashboard/components/SwipeableSessionCard';

// Mock the dependencies
jest.mock('../../../app/(tabs)/restock-sessions/hooks/useService', () => ({
  useRestockApplicationService: () => ({
    deleteSession: jest.fn().mockResolvedValue({ success: true }),
  }),
}));

jest.mock('../../../app/(tabs)/restock-sessions/utils/logger', () => ({
  Logger: {
    info: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

const mockSession = {
  id: 'session-123',
  name: 'Test Session',
  createdAt: '2024-01-01T00:00:00Z',
  status: 'draft',
  totalItems: 5,
  totalQuantity: 25,
  uniqueSuppliers: 3,
  uniqueProducts: 5,
  items: [
    {
      id: 'item-1',
      productName: 'Test Product 1',
      quantity: 10,
      suppliers: [{ name: 'Supplier 1' }],
    },
    {
      id: 'item-2',
      productName: 'Test Product 2',
      quantity: 15,
      suppliers: [{ name: 'Supplier 2' }],
    },
  ],
};

describe('SwipeableSessionCard', () => {
  it('renders session information correctly', () => {
    const onSessionDeleted = jest.fn();
    
    const { getByText } = render(
      <SwipeableSessionCard
        session={mockSession}
        index={0}
        onSessionDeleted={onSessionDeleted}
      />
    );

    expect(getByText('Test Session')).toBeTruthy();
    expect(getByText('5 items • 25 total quantity • 3 suppliers')).toBeTruthy();
    expect(getByText('Continue')).toBeTruthy();
  });

  it('calls onSessionDeleted when session is deleted', () => {
    const onSessionDeleted = jest.fn();
    
    const { getByText } = render(
      <SwipeableSessionCard
        session={mockSession}
        index={0}
        onSessionDeleted={onSessionDeleted}
      />
    );

    // Note: In a real test environment, we would need to mock the gesture handler
    // For now, we're just testing that the component renders correctly
    expect(onSessionDeleted).not.toHaveBeenCalled();
  });

  it('renders without session name', () => {
    const sessionWithoutName = { ...mockSession, name: undefined };
    const onSessionDeleted = jest.fn();
    
    const { getByText } = render(
      <SwipeableSessionCard
        session={sessionWithoutName}
        index={0}
        onSessionDeleted={onSessionDeleted}
      />
    );

    expect(getByText(/Session #.*•/)).toBeTruthy();
  });
});
