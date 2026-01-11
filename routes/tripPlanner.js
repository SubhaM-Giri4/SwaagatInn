const express = require("express");
const router = express.Router();
const tripPlanner = require("../controllers/tripPlannerController");

router.get("/", tripPlanner.showForm);
router.post("/", tripPlanner.generateItinerary);

module.exports = router;
