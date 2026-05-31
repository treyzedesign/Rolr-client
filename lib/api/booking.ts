import { apiClient } from './client';

export interface BookingSlot {
  _id: string;
  start: string;
  end: string;
}

export interface BookingData {
  _id: string;
  candidate_id?: any;
  employer_id?: any;
  job_id?: any;
  available_slots: BookingSlot[];
  status?: string;
  [key: string]: any;
}

export const bookingApi = {
  getBookingDetails: async (token: string): Promise<BookingData> => {
    // The public endpoint to retrieve the booking page data
    const response = await apiClient.get(`/booking/${token}`);
    return response.data;
  },

  confirmBooking: async (token: string, slotId: string): Promise<any> => {
    // The public endpoint to confirm a selected slot
    const response = await apiClient.post(`/booking/${token}`, {
      slot_id: slotId
    });
    return response.data;
  }
};
