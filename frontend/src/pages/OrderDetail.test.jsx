import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import OrderDetail from './OrderDetail';
import orderApi from '../api/orderApi';

vi.mock('../api/orderApi', () => ({
  default: {
    getOrderById: vi.fn(),
  },
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
  }),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
  },
}));

describe('OrderDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders order detail without crashing when order_date is missing', async () => {
    orderApi.getOrderById.mockResolvedValue({
      data: {
        data: {
          id: 99,
          order_date: null,
          status: 'PENDING',
          total_amount: 150000,
          email: 'buyer@example.com',
          full_name: 'Nguyen Van B',
          phone: '0909000000',
          address: '456 Duong XYZ',
          items: [],
        },
      },
    });

    render(
      <React.StrictMode>
        <MemoryRouter initialEntries={['/orders/99']}>
          <Routes>
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/orders" element={<div>Orders Page</div>} />
          </Routes>
        </MemoryRouter>
      </React.StrictMode>
    );

    expect(await screen.findByText('ĐƠN HÀNG #99')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Nguyen Van B')).toBeInTheDocument();
    });
  });
});
