/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import express, {
  Application,
  NextFunction,
  Request,
  Response,
  application,
} from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './app/routes';
import notFound from './app/middlewares/notFound';
import { generateToken } from './app/helper/generatePaymentToken';
import { handleStkPush } from './app/helper/handleStkPush';
const app: Application = express();

// parser
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: ['http://localhost:5173'], credentials: true }));
app.use(express.static('uploads'));
// application routers ----------------
app.use('/api', router);

// for payments
app.post('/stkpush', generateToken, handleStkPush);
// Callback endpoint to handle M-Pesa payment confirmation
app.post('/callback', (req, res) => {
  console.log('nice response here in callback');
  console.log('Callback response received:', req.body);

  const { Body } = req.body;
  if (Body.stkCallback.ResultCode === 0) {
    // Payment was successful
    const metadata = Body.stkCallback.CallbackMetadata;
    const amount = metadata.Item.find(
      (item: any) => item.Name === 'Amount',
    ).Value;
    const transactionId = metadata.Item.find(
      (item: any) => item.Name === 'MpesaReceiptNumber',
    ).Value;
    const phoneNumber = metadata.Item.find(
      (item: any) => item.Name === 'PhoneNumber',
    ).Value;

    // TODO: Update the database or order status as paid
    console.log(
      `Payment successful. Amount: ${amount}, Transaction ID: ${transactionId}, Phone Number: ${phoneNumber}`,
    );
  } else {
    // Payment failed
    console.log(`Payment failed: ${Body.stkCallback.ResultDesc}`);
  }

  // Send acknowledgment response back to M-Pesa
  res.status(200).json({ message: 'Callback received' });
});

const test = (req: Request, res: Response) => {
  Promise.reject();
  // const a = 10;
  // res.send(a);
};

app.get('/', test);

// global error handler
app.use(globalErrorHandler);
// not found
app.use(notFound);

export default app;
