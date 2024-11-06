
import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../user/user.constant";
import validateRequest from "../../middlewares/validateRequest";
import normalUserValidations from "./normalUser.validation";
import NormalUserController from "./normalUser.controller";

const router = express.Router();


router.patch("/update-profile",auth(USER_ROLE.user),validateRequest(normalUserValidations.updateNormalUserData),NormalUserController.updateUserProfile)