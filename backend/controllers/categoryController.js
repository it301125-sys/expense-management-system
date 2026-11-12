const mongoose = require("mongoose");
const Category = require("../models/Category");
const Expense = require("../models/Expense");
// Create a custom category
const addCategory = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Category name is required"
            });
        }
        if (name.trim().length > 30) {
    return res.status(400).json({
        message: "Category name cannot exceed 30 characters."
    });
}
        const category = await Category.create({
            name: name.trim(),
            user: req.user._id
        });

        res.status(201).json({
            message: "Category created successfully!",
            category
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                message: "This category already exists"
            });
        }

        res.status(500).json({
            message: "Failed to create category"
        });
    }
};

// Get all categories belonging to the logged-in user
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({
            user: req.user._id
        }).sort({ name: 1 });

        res.status(200).json(categories);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch categories"
        });
    }
};
// Delete a custom category
const deleteCategory = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
        message: "Invalid category ID."
    });
}
        // Find the category belonging to the logged-in user
        const category = await Category.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }
        // Prevent deletion of default categories
        const defaultCategoryNames = [
    "Food",
    "Shopping",
    "Travel",
    "Bills",
    "Entertainment",
    "Healthcare",
    "Education",
    "Other"
];

if (category.isDefault || defaultCategoryNames.includes(category.name)) {
    return res.status(400).json({
        message: "Default categories cannot be deleted."
    });
}
        // Check whether this category is used by existing expenses
        const existingExpenses = await Expense.countDocuments({
            category: category.name,
            user: req.user._id
        });

        if (existingExpenses > 0) {
            return res.status(400).json({
                message: "Cannot delete this category because it is used by existing expenses."
            });
        }

        // Delete the category if it is not being used
        await Category.findByIdAndDelete(category._id);

        res.status(200).json({
            message: "Category deleted successfully!"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete category"
        });
    }
};

module.exports = {
    addCategory,
    getCategories,
    deleteCategory
};
