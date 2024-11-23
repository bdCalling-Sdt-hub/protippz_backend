/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import express, {
  Application,
  Request,
  Response,
  application,
} from 'express';
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
const upload = multer({ dest: 'uploads/' });
// parser
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: ['http://localhost:5173'], credentials: true }));
app.use("/uploads", express.static("uploads"));
// application routers ----------------
app.use('/', router);
app.post('/contact-us',sendContactUsEmail);

app.post("/upload-csv",auth(USER_ROLE.superAdmin), upload.single('file'),uploadCsvFile)

// global error handler
app.use(globalErrorHandler);
// not found
app.use(notFound);

export default app;
