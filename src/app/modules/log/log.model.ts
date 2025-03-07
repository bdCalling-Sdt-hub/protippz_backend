import { model, Schema } from 'mongoose';

const logSchema = new Schema({
  message: {
    type: String,
  },
  accountId: {
    type: String,
  },
});

const Log = model('Log', logSchema);

export default Log;
