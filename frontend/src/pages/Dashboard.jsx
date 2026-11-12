
import { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from "recharts";

const COLORS = [
    "#5546e8",
    "#16a34a",
    "#f59e0b",
    "#dc5252",
    "#8b5cf6",
    "#0891b2",
    "#ea580c",
    "#64748b"
];

const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;

function Dashboard() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [monthlyBudget, setMonthlyBudget] = useState(0);

    const navigate = useNavigate();

    const fetchExpenses = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await API.get("/expenses", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setExpenses(response.data);
        } catch (error) {
            console.error("Error fetching expenses:", error);

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/login");
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchExpenses();
    }, [fetchExpenses]);

    useEffect(() => {
        const fetchBudget = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await API.get("/budget", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setMonthlyBudget(
                    Number(response.data.monthlyBudget) || 0
                );
            } catch (error) {
                console.error("Error fetching budget:", error);
            }
        };

        fetchBudget();
    }, []);

    // Total spending
    const totalExpenses = expenses.reduce(
        (total, expense) =>
            total + Number(expense.amount || 0),
        0
    );

    // Average expense
    const averageExpense = expenses.length
        ? totalExpenses / expenses.length
        : 0;

    // Current month spending
    const now = new Date();

    const currentMonthExpenses = expenses.filter((expense) => {
        const date = new Date(expense.date);

        return (
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
        );
    });

    const monthlySpent = currentMonthExpenses.reduce(
        (total, expense) =>
            total + Number(expense.amount || 0),
        0
    );

    const remainingBudget = monthlyBudget - monthlySpent;

    const budgetPercentage = monthlyBudget > 0
        ? (monthlySpent / monthlyBudget) * 100
        : 0;

    // Category-wise spending
    const categoryData = Object.values(
        expenses.reduce((result, expense) => {
            const category = expense.category || "Other";

            if (!result[category]) {
                result[category] = {
                    name: category,
                    value: 0
                };
            }

            result[category].value += Number(expense.amount || 0);

            return result;
        }, {})
    ).sort((a, b) => b.value - a.value);

    // Monthly spending for the last six months
    const monthlyData = [];

    for (let i = 5; i >= 0; i--) {
        const date = new Date(
            now.getFullYear(),
            now.getMonth() - i,
            1
        );

        const monthExpenses = expenses.filter((expense) => {
            const expenseDate = new Date(expense.date);

            return (
                expenseDate.getMonth() === date.getMonth() &&
                expenseDate.getFullYear() === date.getFullYear()
            );
        });

        const amount = monthExpenses.reduce(
            (total, expense) =>
                total + Number(expense.amount || 0),
            0
        );

        monthlyData.push({
            month: date.toLocaleString("en-IN", {
                month: "short"
            }),
            amount
        });
    }

    if (loading) {
        return <h2>Loading dashboard...</h2>;
    }

    return (
        <div className="dashboard-container">

            <header className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Welcome back! Here's your financial overview.</p>
                </div>

                <button
                    className="add-expense-button"
                    onClick={() => navigate("/add-expense")}
                >
                    + Add New Expense
                </button>
            </header>

            {/* Summary Cards */}
            <div className="dashboard-cards">

                <div className="dashboard-card">
                    <div className="card-top">
                        <h3>Total Expenses</h3>
                        <span className="card-icon purple-icon">₹</span>
                    </div>
                    <h2>{formatCurrency(totalExpenses)}</h2>
                    <p className="card-description">All recorded expenses</p>
                </div>

                <div className="dashboard-card">
                    <div className="card-top">
                        <h3>Total Transactions</h3>
                        <span className="card-icon blue-icon">▤</span>
                    </div>
                    <h2>{expenses.length}</h2>
                    <p className="card-description">Recorded transactions</p>
                </div>

                <div className="dashboard-card">
                    <div className="card-top">
                        <h3>Average Expense</h3>
                        <span className="card-icon green-icon">↗</span>
                    </div>
                    <h2>{formatCurrency(averageExpense)}</h2>
                    <p className="card-description">Per transaction</p>
                </div>

                <div className="dashboard-card">
                    <div className="card-top">
                        <h3>Budget Used</h3>
                        <span className="card-icon orange-icon">◎</span>
                    </div>
                    <h2>{budgetPercentage.toFixed(1)}%</h2>
                    <p className="card-description">
                        {monthlyBudget > 0
                            ? "Of your monthly budget"
                            : "Set a monthly budget"}
                    </p>
                </div>

            </div>

            {/* Charts */}
            <div className="dashboard-charts-grid">

                <div className="chart-container dashboard-chart">
                    <h2>Monthly Expenses</h2>
                    <p className="chart-subtitle">
                        Your spending over the last six months
                    </p>

                    {expenses.length === 0 ? (
                        <p className="empty-state">
                            Add expenses to see your monthly spending.
                        </p>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={monthlyData}
                                margin={{
                                    top: 15,
                                    right: 10,
                                    left: 5,
                                    bottom: 5
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#e9edf5"
                                />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    formatter={(value) => formatCurrency(value)}
                                />
                                <Bar
                                    dataKey="amount"
                                    name="Expenses"
                                    fill="#5546e8"
                                    radius={[7, 7, 0, 0]}
                                    maxBarSize={45}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="chart-container dashboard-chart">
                    <h2>Spending by Category</h2>
                    <p className="chart-subtitle">
                        How your money is distributed
                    </p>

                    {categoryData.length === 0 ? (
                        <p className="empty-state">
                            Add expenses to see category spending.
                        </p>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="45%"
                                    outerRadius={105}
                                    innerRadius={55}
                                    paddingAngle={3}
                                    stroke="none"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell
                                            key={entry.name}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>

                                <Tooltip
                                    formatter={(value) => formatCurrency(value)}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

            </div>

            {/* Monthly Budget */}
            <div className="budget-summary dashboard-budget">
                <div className="budget-section-heading">
                    <div>
                        <h2>Monthly Budget Overview</h2>
                        <p>Monitor your monthly spending limit.</p>
                    </div>

                    <button
                        className="manage-budget-button"
                        onClick={() => navigate("/budget")}
                    >
                        Manage Budget →
                    </button>
                </div>

                <div className="budget-overview-grid">

                    <div className="budget-overview-item">
                        <span>Monthly Budget</span>
                        <strong>{formatCurrency(monthlyBudget)}</strong>
                    </div>

                    <div className="budget-overview-item">
                        <span>Spent This Month</span>
                        <strong>{formatCurrency(monthlySpent)}</strong>
                    </div>

                    <div className="budget-overview-item">
                        <span>Remaining Budget</span>
                        <strong className={
                            remainingBudget < 0 ? "negative-amount" : ""
                        }>
                            {formatCurrency(remainingBudget)}
                        </strong>
                    </div>

                </div>

                <div className="progress-heading">
                    <h3>Budget Usage</h3>
                    <span>{budgetPercentage.toFixed(1)}%</span>
                </div>

                <div className="progress-track">
                    <div
                        className="progress-fill"
                        style={{
                            width: `${Math.min(budgetPercentage, 100)}%`
                        }}
                    />
                </div>

                {monthlyBudget === 0 ? (
                    <p className="budget-info">
                        Set your monthly budget to start tracking your progress.
                    </p>
                ) : remainingBudget < 0 ? (
                    <p className="budget-warning">
                        You have exceeded your monthly budget.
                    </p>
                ) : (
                    <p className="budget-success">
                        You are within your monthly budget.
                    </p>
                )}
            </div>

        </div>
    );
}

export default Dashboard;
