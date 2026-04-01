import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import BookingPage from './BookingPage';
import bookingApi from '../api/bookingApi';
import toast from 'react-hot-toast';

vi.mock('../api/bookingApi', () => ({
  default: {
    getGarages: vi.fn(),
    createBooking: vi.fn(),
  },
}));

vi.mock('react-hot-toast', () => ({
  default: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

const renderBookingPage = (initialEntry) => render(
  <React.StrictMode>
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/orders" element={<div>Orders Page</div>} />
      </Routes>
    </MemoryRouter>
  </React.StrictMode>
);

describe('BookingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    bookingApi.getGarages.mockResolvedValue({
      data: [
        { id: 'garage-1', name: 'Garage A', address: '123 Street', phone: '0900000000' },
      ],
    });
  });

  it('redirects to orders without showing a missing-order toast when order context is absent', async () => {
    renderBookingPage('/booking');

    await waitFor(() => {
      expect(screen.getByText('Orders Page')).toBeInTheDocument();
    });

    expect(toast.error).not.toHaveBeenCalled();
    expect(bookingApi.getGarages).not.toHaveBeenCalled();
  });

  it('loads garages and renders booking UI when order context is present', async () => {
    renderBookingPage({
      pathname: '/booking',
      state: { orderId: 123 },
    });

    expect(await screen.findByText('Đặt lịch lắp đặt cho đơn hàng #123')).toBeInTheDocument();
    expect(await screen.findByText('Garage A')).toBeInTheDocument();
    expect(bookingApi.getGarages).toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });
});
