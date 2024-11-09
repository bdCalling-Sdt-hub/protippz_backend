import { model, Schema } from 'mongoose';
import { IRewordCategory } from './rewardCategory.interface';
import { ENUM_DELIVERY_OPTION } from '../../utilities/enum';

const rewardCategorySchema: Schema = new Schema<IRewordCategory>({
  name: { type: String, required: true, unique: true },
  image: { type: String, required: true },
  deliveryOption:{
    type: String,
    enum:Object.values(ENUM_DELIVERY_OPTION),
    required:true
  }
},{
  timestamps:true
});


const RewardCategory = model<IRewordCategory>('RewardCategory', rewardCategorySchema);

export default RewardCategory;
