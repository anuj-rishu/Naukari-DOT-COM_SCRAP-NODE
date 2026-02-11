const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");

router.get("/jobs", jobController.getJobs);
router.get("/company/:groupId", jobController.getCompanyJobs);

module.exports = router;
