/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-undef */
import mongoose from 'mongoose';
import { Server as HTTPServer } from 'http'; // Import HTTPServer type
import server from './app';
import { errorLogger, logger } from './app/shared/logger';
import config from './app/config';
import { Server } from 'socket.io';
import socket from './app/socket/socket';

process.on('uncaughtException', (error) => {
  errorLogger.error('Uncaught Exception:', error);
  process.exit(1);
});

let myServer: HTTPServer | undefined;

async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    logger.info('DB Connected Successfully');
    // seedSuperAdmin();

    const port =
      typeof config.port === 'number' ? config.port : Number(config.port);
    myServer = server.listen(port, config.base_url as string, () => {
      logger.info(
        `Example app listening on port http://192.168.10.153:${config.port}`,
      );
    });

    // Set up Socket.IO-----------------
    const socketIO = new Server(myServer, {
      pingTimeout: 60000,
      cors: {
        origin: '*',
      },
    });

    socket(socketIO);

    //@ts-ignore
    global.io = socketIO;
  } catch (error) {
    errorLogger.error('Error in main function:', error);
    throw error;
  }

  process.on('unhandledRejection', (error) => {
    if (myServer) {
      myServer.close(() => {
        errorLogger.error('Unhandled Rejection:', error);
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
}

main().catch((err) => errorLogger.error('Main function error:', err));

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received');
  if (myServer) {
    myServer.close(() => {
      logger.info('Server closed gracefully');
    });
  }
});
