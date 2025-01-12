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
import plaidClient from './app/utilities/plaidClient';
import { User } from './app/modules/user/user.model';
import AppError from './app/error/appError';
import httpStatus from 'http-status';
import handleWebhook from './app/stripeManager/webhook';
const upload = multer({ dest: 'uploads/' });

// web hook
app.post(
  '/protippz/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook,
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
    ],
    credentials: true,
  }),
);
app.use('/uploads', express.static('uploads'));
// application routers ----------------
app.use('/', router);
app.post('/contact-us', sendContactUsEmail);

app.get('/nice', async (req, res) => {
  res.send({ message: 'nice to meet you' });
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

app.post('/create_link_token', async function (request, response) {
  console.log('create link token');
  const user = await User.findOne({ _id: '6762958e7726c39688329f90' });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }
  const clientUserId = user._id;
  console.log('client user id', user);
  const request = {
    user: {
      // This should correspond to a unique id for the current user.
      client_user_id: clientUserId,
    },
    client_name: 'Plaid Test App',
    products: ['auth'],
    language: 'en',
    webhook: 'https://webhook.example.com',
    redirect_uri: 'https://domainname.com/oauth-page.html',
    country_codes: ['US'],
  };
  try {
    const createTokenResponse = await client.linkTokenCreate(request);
    response.json(createTokenResponse.data);
  } catch (error) {
    // handle error
  }
});

// global error handler
app.use(globalErrorHandler);
// not found
app.use(notFound);

export default app;
