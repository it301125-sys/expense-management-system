
const express = require("express");
const router = express.Router();

const {
    addExpense,
    getExpenses,
    updateExpense,
    deleteExpense
} = require("../controllers/expenseController");

const protect = require("../middleware/authMiddleware");

// Add a new expense
router.post("/", protect, addExpense);

// Get all expenses
router.get("/", protect, getExpenses);

// Update an expense
router.put("/:id", protect, updateExpense);

// Delete an expense
router.delete("/:id", protect, deleteExpense);

module.exports = router;
