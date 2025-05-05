// payment.service.ts

import { SslCommerzPayment } from 'sslcommerz';
import Payment from './payment.model';
import PermitTutor from '../sendPermitTutor/permitTutor.mode';

const sslcommerz = new SslCommerzPayment(
  process.env.STORE_ID as string,
  process.env.STORE_PASSWORD as string,
  false, // Change to true for live mode
);

export const processPayment = async (
  requestId: string,
  selectedDate: Date,
  amount: number,
): Promise<string> => {
  // console.log("from service")
  const transactionId = `txn_${Date.now()}`;

  const updatedRequest = await PermitTutor.findByIdAndUpdate(
    requestId,
    { selectedDate, price: amount },
    { new: true },
  );
  console.log('updated request', updatedRequest);
  if (!updatedRequest) {
    throw new Error('Request not found');
  }

  const paymentData = {
    total_amount: amount,
    currency: 'BDT',
    tran_id: transactionId,
    success_url: `https://tutor-link-server-project.vercel.app/api/payment/success/${transactionId}`,
    fail_url: `https://tutor-link-server-project.vercel.app/api/payment/fail`,
    cancel_url: `https://tutor-link-server-project.vercel.app/api/payment/cancel`,
    ipn_url: 'http://localhost:3030/ipn',
    shipping_method: 'Courier',
    product_name: 'Tutor Booking', // Tutor name as the product
    product_category: 'Subject', // Subject as the product category
    product_profile: 'general',
    cus_name: 'Student',
    cus_email: updatedRequest.userEmail,
    cus_phone: '01700000000',
    cus_add1: 'Dhaka',
    cus_add2: 'Dhaka',
    cus_city: 'Dhaka',
    cus_state: 'Dhaka',
    cus_postcode: '1000',
    cus_country: 'Bangladesh',
    // Use customer phone if available
    cus_fax: '01711111111', // Or remove if not needed
    ship_name: 'Customer Name', // Or use actual shipping name
    ship_add1: 'Dhaka',
    ship_add2: 'Dhaka',
    ship_city: 'Dhaka',
    ship_state: 'Dhaka',
    ship_postcode: 1000,
    ship_country: 'Bangladesh',
  };

  const response = await sslcommerz.init(paymentData);
  // console.log('Order Saved:', response);
  // Save the order data to the database
  const finalOrder = {
    items: 'Tutor Booking',
    paidStatus: 'true',
    requestId: requestId,
    transaction: transactionId,
    tutorId: updatedRequest.tutorId,
    tutorName: updatedRequest.tutorId,
    totalAmount: updatedRequest.price,
    userEmail: updatedRequest.userEmail,
  };

  const createdOrder = await Payment.create(finalOrder);
  console.log('Order Saved:', createdOrder);

  return response.GatewayPageURL;
};

export const handleFailedOrCanceledPayment = async (
  transactionId: string,
  status: 'failed' | 'canceled',
) => {
  const order = await Payment.findOne({ transaction: transactionId });

  if (!order) {
    return null;
  }

  await Payment.updateOne(
    { transaction: transactionId },
    { paidStatus: status },
  );

  await PermitTutor.findByIdAndUpdate(
    order.requestId,
    { isPayment: false },
    { new: true },
  );

  return order;
};

export const getMyBookingsFromDB = async (userEmail: string) => {
  return await Payment.find({ userEmail });
};

export const getBookingsForTutor = async (tutorId: string) => {
  const requests = await Payment.find({ tutorId }).exec();
  return requests;
};
