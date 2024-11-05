/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server, Socket } from 'socket.io';

const socket = (io: Server) => {
  io.on('connection', async (socket: Socket) => {
    console.log('A user connected');
    const userId = socket.handshake.query.id;
    socket.join(userId as string);
    socket.on('nice', async (data: any) => {
      console.log('data', data);
    });

    // Disconnect user
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });
  });
};

export default socket;
