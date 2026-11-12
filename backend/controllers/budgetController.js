const User = require("../models/User");

// Get user's monthly budget
const getBudget = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        res.status(200).json({
            monthlyBudget: user.monthlyBudget
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch budget"
        });
    }
};

// Update user's monthly budget
const updateBudget = async (req, res) => {
    try {
        const { monthlyBudget } = req.body;

        if (
    monthlyBudget === undefined ||
    monthlyBudget === null ||
    String(monthlyBudget).trim() === "" ||
    !Number.isFinite(Number(monthlyBudget)) ||
    Number(monthlyBudget) < 0
) {
            return res.status(400).json({
                message: "Please enter a valid budget"
            });
        }

        const user = await User.findById(req.user._id);

        user.monthlyBudget = Number(monthlyBudget);

        await user.save();

        res.status(200).json({
            message: "Budget updated successfully!",
            monthlyBudget: user.monthlyBudget
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update budget"
        });
    }
};

module.exports = {
    getBudget,
    updateBudget
};