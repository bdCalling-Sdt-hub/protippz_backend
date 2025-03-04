/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Application, Request, Response, application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './app/routes';
import notFound from './app/middlewares/notFound';
const app: Application = express();
import multer from 'multer';
import uploadCsvFile from './app/helper/uploadCsvFile';
import auth from './app/middlewares/auth';
import { USER_ROLE } from './app/modules/user/user.constant';
import sendContactUsEmail from './app/helper/sendContactUsEmail';
import uploadCsvWithProgress from './app/helper/uploadCsvWithProgress';
import handleWebhook from './app/stripeManager/webhook';
import Stripe from 'stripe';
import config from './app/config';
import handleWebhook2 from './app/stripeManager/webhook2';
const upload = multer({ dest: 'uploads/' });
const stripe = new Stripe(config.stripe.stripe_secret_key as string, {
  apiVersion: '2024-09-30.acacia',
});
// web hook---------------
app.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);
app.post(
  '/webhook/connected-account',
  express.raw({ type: 'application/json' }),
  handleWebhook2,
);
// parser-----------------------
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004',
      'http://localhost:3005',
      'http://localhost:3006',
      'http://localhost:3007',
      'http://localhost:3008',
      'http://localhost:5173',
      'http://192.168.10.25:3000',
      'http://192.168.10.25:4173',
      'http://192.168.10.25:3000',
      'http://18.218.23.153:4173',
      'http://18.218.23.153:3000',
      'https://www.protippz.com',
      'https://protippz.com',
      'https://admin.protippz.com',
      'http://www.protippz.com',
      'http://admin.protippz.com',
    ],
    credentials: true,
  }),
);
app.use('/uploads', express.static('uploads'));
// application routers ----------------
app.use('/', router);
app.post('/contact-us', sendContactUsEmail);

app.get('/nice', async (req, res) => {
  res.send({ message: 'nice to meet you man protippz' });
});

app.post(
  '/upload-csv',
  auth(USER_ROLE.superAdmin),
  upload.single('file'),
  uploadCsvFile,
);
app.post(
  '/upload-csv-with-progress',
  upload.single('file'),
  uploadCsvWithProgress,
);
app.get('/upload-progress', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Here you send progress updates like this:
  let progress = 0;
  const interval = setInterval(() => {
    if (progress >= 100) {
      clearInterval(interval);
      res.write(`data: {"message": "Upload complete"}\n\n`);
    } else {
      progress += 10;
      res.write(`data: {"progress": ${progress}}\n\n`);
    }
  }, 1000);
});

// onboarding refresh url
router.get('/stripe/onboarding/refresh', async (req, res, next) => {
  try {
    const { accountId } = req.query;

    if (!accountId) {
      return res.status(400).send('Missing accountId');
    }

    // Generate a new onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: accountId as string,
      refresh_url: `${config.onboarding_refresh_url}?accountId=${accountId}`,
      return_url: config.onboarding_return_url,
      type: 'account_onboarding',
    });

    // Redirect the user to the new onboarding link
    res.redirect(accountLink.url);
  } catch (error) {
    next(error); // Pass errors to error handling middleware
  }
});

// global error handler
app.use(globalErrorHandler);
// not found
app.use(notFound);

export default app;
