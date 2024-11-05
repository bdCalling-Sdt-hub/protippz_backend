import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import rewardValidations from "./reward.validation";
import RewardController from "./reward.controller";

const router = express.Router();

router.post("/create", validateRequest(rewardValidations.createRewardSchema), RewardController.createReward);
router.get("/get-all", RewardController.getAllRewards);
router.get("/get-single/:id", RewardController.getSingleReward);
router.patch("/update/:id", validateRequest(rewardValidations.updateRewardSchema), RewardController.updateReward);
router.delete("/delete/:id", RewardController.deleteReward);

export const rewardRoutes = router;
