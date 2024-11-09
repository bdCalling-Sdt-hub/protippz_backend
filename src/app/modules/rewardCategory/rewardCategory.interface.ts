import { ENUM_DELIVERY_OPTION } from "../../utilities/enum";

export interface IRewordCategory {
  name: string;
  image: string;
  deliveryOption:typeof ENUM_DELIVERY_OPTION[keyof typeof ENUM_DELIVERY_OPTION];
}
