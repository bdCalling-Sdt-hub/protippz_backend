import { model, Schema } from "mongoose";
import { ITip } from "./tip.interface";
import { ENUM_PAYMENT_STATUS, ENUM_TIP_BY } from "../../utilities/enum";

const tipSchema = new Schema<ITip>({
    user: { type: Schema.Types.ObjectId, ref: "NormalUser", required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    entityType: { type: String, enum: ["Team", "Player"], required: true },
    point:{Type:Number,required:true},
    amount: { type: Number, required: true },
    paymentStatus: { type: String, enum: Object.values(ENUM_PAYMENT_STATUS), required: true },
    tipBy: { type: String, enum: Object.values(ENUM_TIP_BY), required: true },
    transactionId:{Type:String}
  },{
    timestamps:true
  });



  const Tip = model("Tip",tipSchema);

  export default Tip;