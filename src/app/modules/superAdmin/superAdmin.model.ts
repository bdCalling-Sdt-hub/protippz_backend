import { model, Schema } from 'mongoose';
import { ISuperAdmin } from './superAdmin.interface';

const superAdminSchema = new Schema<ISuperAdmin>({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    // unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  address: {
    type: String,
    required: true,
  },
  profile_image: {
    type: String,
    default: '',
  },
});
const NormalUser = model<ISuperAdmin>('SuperAdmin', superAdminSchema);

export default NormalUser;
