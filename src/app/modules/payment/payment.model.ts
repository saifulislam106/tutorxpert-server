import { model, Schema } from 'mongoose';

// Order Schema (Updated)
const OrderSchema = new Schema(
  {
    userEmail: {
      type: String,
    },

    tutorId: {
      type: String,
    },
    tutorName: {
      type: String,
    },
    salary: {
      type: Number,
    },
    subject: {
      type: String,
    },
    totalAmount: {
      type: String,
    },
    requestId: {
      type: String,
    },
    transaction: {
      type: String,
    },
    paidStatus: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Payment = model('order', OrderSchema);
export default Payment;
