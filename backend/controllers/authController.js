const User = require("../models/User");
const Category = require("../models/Category");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Expense = require("../models/Expense");

// Register user
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
) {
    return res.status(400).json({
        message: "Please provide valid name, email, and password values."
    });
}

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email.trim())) {
    return res.status(400).json({
        message: "Please enter a valid email address."
    });
}
        if (name.trim().length < 2) {
    return res.status(400).json({
        message: "Name must contain at least 2 characters."
    });
}

if (name.trim().length > 50) {
    return res.status(400).json({
        message: "Name cannot exceed 50 characters."
    });
}
        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters"
            });
        }
        if (Buffer.byteLength(password, "utf8") > 72) {
    return res.status(400).json({
        message: "Password cannot exceed 72 bytes."
    });
}
        const normalizedEmail = email.trim().toLowerCase();

const existingUser = await User.findOne({
    email: normalizedEmail
});

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword
        });
        const defaultCategories = [
    "Food",
    "Shopping",
    "Travel",
    "Bills",
    "Entertainment",
    "Healthcare",
    "Education",
    "Other"
];

await Category.insertMany(
    defaultCategories.map((categoryName) => ({
        name: categoryName,
        user: user._id,
        isDefault: true
    }))
);
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            message: "Registration successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
        message: "Registration failed. Please try again."
    });
}
};


// Login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (
    typeof email !== "string" ||
    typeof password !== "string"
) {
    return res.status(400).json({
        message: "Please provide valid email and password values."
    });
}
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }
        if (Buffer.byteLength(password, "utf8") > 72) {
    return res.status(400).json({
        message: "Invalid email or password."
    });
}
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email.trim())) {
    return res.status(400).json({
        message: "Please enter a valid email address."
    });
}
        const normalizedEmail = email.trim().toLowerCase();

const user = await User.findOne({
    email: normalizedEmail
});

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
        message: "Login failed. Please try again."
    });
}
};

// Get logged-in user's profile
const getProfile = async (req, res) => {
    try {
        res.status(200).json({
            name: req.user.name,
            email: req.user.email,
            monthlyBudget: req.user.monthlyBudget
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch profile"
        });
    }
};

// Update logged-in user's profile
const updateProfile = async (req, res) => {
    try {
        const { name } = req.body;
        if (typeof name !== "string") {
    return res.status(400).json({
        message: "Name must be a valid text value."
    });
}
        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Name is required"
            });
        }
        if (name.trim().length < 2) {
    return res.status(400).json({
        message: "Name must contain at least 2 characters."
    });
}
        if (name.trim().length > 50) {
    return res.status(400).json({
        message: "Name cannot exceed 50 characters."
    });
}
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        user.name = name.trim();

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully!",
            name: user.name,
            email: user.email,
            monthlyBudget: user.monthlyBudget
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update profile"
        });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (
    typeof currentPassword !== "string" ||
    typeof newPassword !== "string"
) {
    return res.status(400).json({
        message: "Please provide valid password values."
    });
}
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Please enter both passwords"
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                message: "New password must contain at least 8 characters"
            });
        }
        if (Buffer.byteLength(newPassword, "utf8") > 72) {
    return res.status(400).json({
        message: "New password cannot exceed 72 bytes."
    });
}
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Current password is incorrect"
            });
        }
        // Prevent reusing the current password
const isSamePassword = await bcrypt.compare(
    newPassword,
    user.password
);

if (isSamePassword) {
    return res.status(400).json({
        message: "New password must be different from your current password."
    });
}
        user.password = await bcrypt.hash(newPassword, 12);

        await user.save();

        res.status(200).json({
            message: "Password changed successfully!"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to change password"
        });
    }
};

// Delete user account
const deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;
        if (typeof password !== "string") {
    return res.status(400).json({
        message: "Please provide a valid password."
    });
}
        if (!password) {
            return res.status(400).json({
                message: "Please enter your password"
            });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Incorrect password"
            });
        }

        await Expense.deleteMany({ user: user._id });
        await Category.deleteMany({ user: user._id });
        await User.findByIdAndDelete(user._id);

        res.status(200).json({
            message: "Account deleted successfully"
        });

    } catch (error) {
        console.error("Account deletion error:", error);

        res.status(500).json({
            message: "Failed to delete account"
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getProfile,
    updateProfile,
    changePassword,
    deleteAccount
};