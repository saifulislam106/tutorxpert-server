import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import router from './app/routes';
import { globalErrorHandler } from './app/middlewares/globalErrorHandler';
import Stripe from 'stripe';
import PermitTutor from './app/modules/sendPermitTutor/permitTutor.mode';
import config from './app/config';


const app: Application = express();

app.use(express.json());
const corsOptions = {
  origin: ['http://localhost:3000'], // allow multiple origins
  credentials: true, // allow cookies, authorization headers, etc.
};

// Apply CORS with options
app.use(cors(corsOptions));
app.use('/api', router);

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to tutor link ');
});


if (!config.stripe_sk) {
  throw new Error('Stripe secret key is not defined in the configuration.');
}
const stripe = new Stripe(config.stripe_sk, { apiVersion: '2025-04-30.basil' });

app.post('/create-checkout-session', async (req, res) => {
  console.log('test');
  try {
    const { data } = req.body;

    console.log('data', data);

    const lineItems = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: data.tutorId.name,
          },
          unit_amount: Math.round(data.price * 100),
        },
      },
      // quantity: 1, // Ensure quantity is included
    ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',

      success_url: `http://localhost:3000/sucess?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: 'http://localhost:3000/failed',
      metadata: {
        email: data.userEmail,
        totalPrice: data.price,
        isPayment: data.isPayment,
        id: data._id,
      },
    });

    // const paymentConfirmation = await stripe.checkout.sessions.retrieve(
    //   session.id,
    // );

    console.log('paymentConfirmation', session);
    // const paymentIntent = await stripe.paymentIntents.retrieve(session.id);

    // console.log(`Payment status: ${paymentIntent.status}`);

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

app.get(
  '/checkout-session/:sessionId',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const session = await stripe.checkout.sessions.retrieve(
        req.params.sessionId,
      );

      console.log('Payment session details:', session);

      const { email, id, isPayment, totalPrice } = session.metadata;

      // Now fetch Tutor permit data
      const tutorPermit = await PermitTutor.findByIdAndUpdate(
        id,
        {
          isPayment: true,
        },
        { new: true },
      ); // Assuming `Product` is your Mongoose model

      if (!tutorPermit) {
        res.status(404).json({ error: 'tutorPermit not found' });
        return;
      }

      res.json({
        tutorPermit,
      });
    } catch (error) {
      console.error('Error retrieving checkout session:', error);
      res.status(500).json({ error: 'Failed to retrieve session details' });
    }
  },
);

app.use(globalErrorHandler);

export const App = app;
