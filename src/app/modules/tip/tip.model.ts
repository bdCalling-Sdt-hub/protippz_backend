import { model, Schema } from "mongoose";
import { ITip } from "./tip.interface";

const tipSchema = new Schema<ITip>({
    user: { type: Schema.Types.ObjectId, ref: "NormalUser", required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    entityType: { type: String, enum: ["Team", "Player"], required: true },
    amount: { type: Number, required: true },
  },{
    timestamps:true
  });



  const Tip = model("Tip",tipSchema);

  export default Tip;