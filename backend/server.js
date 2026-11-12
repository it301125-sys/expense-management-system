const expenseRoutes = require("./routes/expenseRoutes");
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const budgetRoutes = require("./routes/budgetRoutes");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
dotenv.config();

const app = express();

// Middleware
app.use(express.json());

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173"
}));

// Default route
app.get("/", (req, res) => {
    res.json({
        message: "Expense Management System API is running!"
    });
});

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/categories", categoryRoutes);
// Start server after database connects
const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

startServer();
