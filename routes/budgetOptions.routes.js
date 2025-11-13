const express = require("express");
const router = express.Router();
const BudgetController = require("../controllers/budgetOptions.controller");

router.get("/", BudgetController.getBudgetOptions);

module.exports = router;
