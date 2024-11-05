import { model, Schema } from 'mongoose';
import { IRewordCategory } from './rewardCategory.interface';

const rewardCategorySchema: Schema = new Schema<IRewordCategory>({
  name: { type: String, required: true, unique: true },
  image: { type: String, required: true },
});


const RewardCategory = model<IRewordCategory>('RewardCategory', rewardCategorySchema);

export default RewardCategory;
