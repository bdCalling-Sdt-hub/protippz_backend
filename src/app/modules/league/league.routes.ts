import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import leagueValidations from "./league.validation";
import LeagueController from "./league.controller";

const router = express.Router();


router.post("/create",validateRequest(leagueValidations.createLeagueSchema),LeagueController.createLeague);
router.get("/get-all",LeagueController.getAllLeague);
router.get('/get-single/:id',LeagueController.getSingleLeague);
router.patch("/update/:id",validateRequest(leagueValidations.updateLeagueSchema));
router.delete("/delete/:id",LeagueController.deleteLeague);


export const leagueRoutes = router;