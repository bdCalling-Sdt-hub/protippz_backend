import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import playerValidations from "./player.validation";
import PlayerController from "./player.controller";

const router = express.Router();

router.post("/create", validateRequest(playerValidations.createPlayerValidationSchema), PlayerController.createPlayer);
router.get("/get-all", PlayerController.getAllPlayers);
router.get("/get-single/:id", PlayerController.getSinglePlayer);
router.patch("/update/:id", validateRequest(playerValidations.updatePlayerValidationSchema), PlayerController.updatePlayer);
router.delete("/delete/:id", PlayerController.deletePlayer);

export const playerRoutes = router;
