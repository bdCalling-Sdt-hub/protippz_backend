import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import teamValidations from "./team.validation";
import TeamController from "./team.controller";

const router = express.Router();

router.post("/create", validateRequest(teamValidations.createTeamSchema), TeamController.createTeam);
router.get("/get-all", TeamController.getAllTeams);
router.get("/get-single/:id", TeamController.getSingleTeam);
router.patch("/update/:id", validateRequest(teamValidations.updateTeamSchema), TeamController.updateTeam);
router.delete("/delete/:id", TeamController.deleteTeam);

export const teamRoutes = router;
