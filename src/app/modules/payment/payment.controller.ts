/* eslint-disable @typescript-eslint/no-explicit-any */
// payment.controller.ts
import { Request, Response } from 'express';
import {
  getBookingsForTutor,
  getMyBookingsFromDB,
  handleFailedOrCanceledPayment,
  processPayment,
} from './payment.service';

import Payment from './payment.model';

import { StatusCodes } from 'http-status-codes';
import PermitTutor from '../sendPermitTutor/permitTutor.mode';
import { catchAsync } from '../../utills/catchAsync';
import sendResponse from '../../utills/sendResponse';


export const initiatePayment = async (req: Request, res: Response) => {
  console.log('hi from controller');
  try {
    const { requestId, selectedDate, amount } = req.body;
    const paymentUrl = await processPayment(requestId, selectedDate, amount);
    res.json({ paymentUrl });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const successPayment = async (req: Request, res: Response) => {
  const { transactionId } = req.params;
  console.log('Payment success', transactionId);
  const order = await Payment.findOne({ transaction: transactionId });
  console.log(order);
  await PermitTutor.findByIdAndUpdate(
    order?.requestId,
    { isPayment: true },
    { new: true },
  );

  return res.redirect(`http://localhost:3000/success/${transactionId}`); //here will add frountend base url or vercel url
};

export const failPayment = async (req: Request, res: Response) => {
  const { transactionId } = req.params;
  console.log('Payment failed', transactionId);

  const result = await handleFailedOrCanceledPayment(transactionId, 'failed');
  console.log(result, 'fail result');

  return res.redirect(`http://localhost:3000/fail`); //here will add frountend base url or vercel link
};

export const cancelPayment = async (req: Request, res: Response) => {
  const { transactionId } = req.params;
  console.log('Payment canceled', transactionId);

  const result = await handleFailedOrCanceledPayment(transactionId, 'canceled');
  console.log(result, 'cancel result');
  // if (!result) {
  //     return res.status(404).json({ error: "Transaction not found" });
  // }

  return res.redirect(`http://localhost:3000/cancel`); //here will add frountend base url or vercel link
};

export const getMyBookings = catchAsync(async (req, res) => {
  const { userEmail } = req.params;

  const result = await getMyBookingsFromDB(userEmail);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'MyBookings retrieved successfully',
    data: result,
  });
});

export const getBookingsByTutorId = async (req: Request, res: Response) => {
  try {
    const tutorId = req.params.tutorId;
    const requests = await getBookingsForTutor(tutorId);

    if (!requests || requests.length === 0) {
      res.json({
        status: false,
        message: 'No requests found for this tutor.',
      });
    }

    res.json({
      status: true,
      message: 'Requests fetched successfully',
      data: requests,
    });
  } catch (error) {
    res.json({
      status: false,
      message: 'Something went wrong',
      error,
    });
  }
};
