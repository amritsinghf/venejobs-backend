const express = require("express");
const router = express.Router();
const ProjectOptionsController = require("../controllers/projectOptions.controller");

router.get("/", ProjectOptionsController.getProjectOptions);

module.exports = router;
