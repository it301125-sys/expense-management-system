const Expense = require("../models/Expense");
const Category = require("../models/Category");
// Validate expense data
const validateExpense = (title, amount, category, date, description) => {
    if (!title || !title.trim()) {
        return "Expense title is required.";
    }

    if (title.trim().length > 50) {
        return "Expense title cannot exceed 50 characters.";
    }

    if (
        amount === undefined ||
        amount === null ||
        amount === "" ||
        !Number.isFinite(Number(amount)) ||
        Number(amount) <= 0
    ) {
        return "Amount must be greater than zero.";
    }

    if (!/^\d+(\.\d{1,2})?$/.test(String(amount))) {
        return "Amount can have a maximum of 2 decimal places.";
    }

    if (!category || !category.trim()) {
        return "Category is required.";
    }

    if (date !== undefined && date !== null && date !== "") {
    const dateString = String(date);
    const dateOnly = dateString.slice(0, 10);

    // Accept YYYY-MM-DD or ISO date-time format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
        return "Please provide a valid date.";
    }

    const expenseDate = new Date(`${dateOnly}T00:00:00`);

    if (
        Number.isNaN(expenseDate.getTime()) ||
        expenseDate.getFullYear() !== Number(dateOnly.slice(0, 4)) ||
        expenseDate.getMonth() + 1 !== Number(dateOnly.slice(5, 7)) ||
        expenseDate.getDate() !== Number(dateOnly.slice(8, 10))
    ) {
        return "Please provide a valid date.";
    }

    const today = new Date();

    const todayString = `${today.getFullYear()}-${String(
        today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    if (dateOnly > todayString) {
        return "Expense date cannot be in the future.";
    }
}
    if (description !== undefined && description.length > 500) {
        return "Description cannot exceed 500 characters.";
    }
    return null;
}
// 1. Add a new expense
const addExpense = async (req, res) => {
    try {
        const { title, amount, category, description, date } = req.body;

        const validationError = validateExpense(
            title,
            amount,
            category,
            date,
            description
        );
        if (validationError) {
            return res.status(400).json({
            message: validationError
       });
    }
    const categoryExists = await Category.findOne({
    name: category.trim(),
    user: req.user._id
});

if (!categoryExists) {
    return res.status(400).json({
        message: "Please select a valid category."
    });
}
        const expense = await Expense.create({
            title,
            amount,
            category,
            description,
            date,
            user: req.user._id
        });

        res.status(201).json({
            message: "Expense added successfully",
            expense
        });

    } catch (error) {
    console.error("Add Expense Error:", error);

    res.status(500).json({
        message: "Server error while adding expense."
    });
}
};

// 2. Get all expenses of logged-in user
const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({
            user: req.user._id
        }).sort({ date: -1 });

        res.status(200).json(expenses);

    } catch (error) {
    console.error("Get Expenses Error:", error);

    res.status(500).json({
        message: "Server error while fetching expenses."
    });
}
};

// 3. Update an expense
const updateExpense = async (req, res) => {
    try {
        const mongoose = require("mongoose");

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid expense ID."
            });
        }
        const expense = await Expense.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!expense) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        const { title, amount, category, description, date } = req.body;

const updatedTitle = title !== undefined ? title : expense.title;
const updatedAmount = amount !== undefined ? amount : expense.amount;
const updatedCategory = category !== undefined ? category : expense.category;
const updatedDate = date !== undefined ? date : expense.date;
        const updatedDescription = description !== undefined
    ? description
    : expense.description;
const validationError = validateExpense(
    updatedTitle,
    updatedAmount,
    updatedCategory,
    updatedDate,
    updatedDescription
);

if (validationError) {
    return res.status(400).json({
        message: validationError
    });
}
const categoryExists = await Category.findOne({
    name: updatedCategory.trim(),
    user: req.user._id
});

if (!categoryExists) {
    return res.status(400).json({
        message: "Please select a valid category."
    });
}
if (title !== undefined) expense.title = title.trim();
if (amount !== undefined) expense.amount = amount;
if (category !== undefined) expense.category = category.trim();
if (description !== undefined) expense.description = description;
if (date !== undefined) expense.date = date;

        await expense.save();

        res.status(200).json({
            message: "Expense updated successfully",
            expense
        });

    } catch (error) {
    res.status(500).json({ message: error.message });
}
};

// 4. Delete an expense
const deleteExpense = async (req, res) => {
    try {
        const mongoose = require("mongoose");

if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
        message: "Invalid expense ID."
    });
}
        const expense = await Expense.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!expense) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        res.status(200).json({
            message: "Expense deleted successfully"
        });

    } catch (error) {
    console.error("Delete Expense Error:", error);

    res.status(500).json({
        message: "Server error while deleting expense."
    });
}
};

module.exports = {
    addExpense,
    getExpenses,
    updateExpense,
    deleteExpense
};
