import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Checkout from './Checkout';

const navigateMock = vi.fn();
const getCartMock = vi.fn();
const createOrderMock = vi.fn();
const toastErrorMock = vi.fn();
const toastSuccessMock = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: true,
  }),
}));

vi.mock('../api/cartApi', () => ({
  default: {
    getCart: (...args) => getCartMock(...args),
  },
}));

vi.mock('../api/orderApi', () => ({
  default: {
    createOrder: (...args) => createOrderMock(...args),
  },
}));

vi.mock('react-hot-toast', () => ({
  default: {
    error: (...args) => toastErrorMock(...args),
    success: (...args) => toastSuccessMock(...args),
  },
}));

describe('Checkout', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    getCartMock.mockReset();
    createOrderMock.mockReset();
    toastErrorMock.mockReset();
    toastSuccessMock.mockReset();

    getCartMock.mockResolvedValue({
      data: {
        data: {
          items: [
            {
              id: 1,
              name: 'Brake Pad',
              quantity: 1,
              subtotal: 100000,
            },
          ],
          total: 100000,
        },
      },
    });

    createOrderMock.mockResolvedValue({
      data: {
        data: {
          order_id: 123,
        },
      },
    });
  });

  it('submits the entered shipping payload when creating an order', async () => {
    render(<Checkout />);

    expect(await screen.findByText('THANH TOÁN ĐƠN HÀNG')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Nhập họ tên'), {
      target: { name: 'full_name', value: 'Nguyen Van A' },
    });
    fireEvent.change(screen.getByPlaceholderText('Nhập số điện thoại'), {
      target: { name: 'phone', value: '0901234567' },
    });
    fireEvent.change(screen.getByPlaceholderText('Nhập địa chỉ chi tiết'), {
      target: { name: 'address', value: '123 Le Loi, Quan 1' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ghi chú về thời gian giao hàng, v.v...'), {
      target: { name: 'notes', value: 'Giao buoi sang' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'ĐẶT HÀNG' }));

    await waitFor(() => {
      expect(createOrderMock).toHaveBeenCalledWith({
        full_name: 'Nguyen Van A',
        phone: '0901234567',
        address: '123 Le Loi, Quan 1',
        notes: 'Giao buoi sang',
      });
    });
  });
});
