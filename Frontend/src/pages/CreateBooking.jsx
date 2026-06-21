import React from 'react';
import * as Yup from 'yup';
const validationSchema = Yup.object({
  bookingId: Yup.string().required('Booking ID is required'),
});
export default function CreateBooking({ mode }) {
  return (
    <div>
      <h2>Booking Creator / Editor: {mode}</h2>
    </div>
  );
}
