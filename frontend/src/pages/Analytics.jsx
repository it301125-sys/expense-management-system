
import { useEffect, useState } from "react";
import API from "../services/api";
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

function Analytics() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState("all");

    // Fetch expenses
    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await API.get("/expenses", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setExpenses(response.data);
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchExpenses();
    }, []);

    if (loading) {
        return <h2>Loading analytics...</h2>;
    }

    // Filter expenses according to selected date range
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    if (dateRange === "7days") {
        startDate.setDate(startDate.getDate() - 6);
    } else if (dateRange === "30days") {
        startDate.setDate(startDate.getDate() - 29);
    } else if (dateRange === "month") {
        startDate.setDate(1);
    } else if (dateRange === "year") {
        startDate.setMonth(0, 1);
    }

    const filteredExpenses = expenses.filter((expense) => {
        const expenseDate = new Date(expense.date);

        if (Number.isNaN(expenseDate.getTime())) {
            return false;
        }

        if (dateRange === "all") {
            return true;
        }

        return expenseDate >= startDate && expenseDate <= today;
    });

    // Category-wise spending
    const categoryData = filteredExpenses.reduce((result, expense) => {
        const category = expense.category || "Other";

        if (!result[category]) {
            result[category] = {
                name: category,
                value: 0
            };
        }

        result[category].value += Number(expense.amount || 0);

        return result;
    }, {});

    const categoryChartData = Object.values(categoryData).sort(
        (a, b) => b.value - a.value
    );

    // Monthly spending
    const monthlyData = Object.values(
        filteredExpenses.reduce((result, expense) => {
            const date = new Date(expense.date);

            const month = date.toLocaleString("en-IN", {
                month: "short",
                year: "numeric"
            });

            if (!result[month]) {
                result[month] = {
                    month,
                    amount: 0,
                    sortDate: new Date(
                        date.getFullYear(),
                        date.getMonth(),
                        1
                    ).getTime()
                };
            }

            result[month].amount += Number(expense.amount || 0);

            return result;
        }, {})
    ).sort((a, b) => a.sortDate - b.sortDate);

    // Total spending for selected period
    const totalSpent = filteredExpenses.reduce(
        (total, expense) =>
            total + Number(expense.amount || 0),
        0
    );

    // Highest spending category
    const highestCategory = categoryChartData[0];
    const handleExportAnalytics = () => {
    const headers = ["Title", "Category", "Amount", "Date"];

    const rows = filteredExpenses.map((expense) => [
        expense.title || "",
        expense.category || "Other",
        expense.amount || 0,
        new Date(expense.date).toLocaleDateString("en-IN")
    ]);

    const csvContent = [headers, ...rows]
        .map((row) =>
            row.map((value) =>
                `"${String(value).replace(/"/g, '""')}"`
            ).join(",")
        )
        .join("\n");

    const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "expenso-analytics-report.csv";
    link.click();

    URL.revokeObjectURL(url);
};
    return (
        <div className="dashboard-container">

            {/* Header */}
            <header className="dashboard-header">
                <div>
                    <h1>Analytics</h1>

                    <p>
                        Understand your spending patterns and trends.
                    </p>
{/* Date Range Filter and Export Button */}
<div className="analytics-toolbar">
    <select
        value={dateRange}
        onChange={(e) => setDateRange(e.target.value)}
        className="date-range-select"
    >
        <option value="7days">Last 7 Days</option>
        <option value="30days">Last 30 Days</option>
        <option value="month">This Month</option>
        <option value="year">This Year</option>
        <option value="all">All Time</option>
    </select>

    <button
        className="analytics-export-btn"
        onClick={handleExportAnalytics}
        disabled={filteredExpenses.length === 0}
    >
    <span>↓</span> Export Report
    </button>
</div>
                </div>
            </header>

            {/* Summary Cards */}
            <div className="dashboard-cards">

                <div className="dashboard-card">
                    <div className="card-top">
                        <h3>Total Spending</h3>
                        <span className="card-icon purple-icon">₹</span>
                    </div>

                    <h2>{formatCurrency(totalSpent)}</h2>

                    <p className="card-description">
                        Spending in selected period
                    </p>
                </div>

                <div className="dashboard-card">
                    <div className="card-top">
                        <h3>Total Transactions</h3>
                        <span className="card-icon blue-icon">▤</span>
                    </div>

                    <h2>{filteredExpenses.length}</h2>

                    <p className="card-description">
                        Transactions in selected period
                    </p>
                </div>

                <div className="dashboard-card">
                    <div className="card-top">
                        <h3>Highest Spending Category</h3>
                        <span className="card-icon green-icon">↗</span>
                    </div>

                    <h2>{highestCategory?.name || "No Data"}</h2>

                    <p className="card-description">
                        {highestCategory
                            ? formatCurrency(highestCategory.value)
                            : "No spending recorded"}
                    </p>
                </div>

            </div>

            {/* Both Charts */}
            <div className="analytics-charts-grid">

                {/* Category Donut Chart */}
                <div className="chart-container dashboard-chart">
                    <h2>Spending by Category</h2>

                    <p className="chart-subtitle">
                        How your money is distributed
                    </p>

                    {categoryChartData.length === 0 ? (
                        <p className="empty-state">
                            No expenses found for this period.
                        </p>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryChartData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="45%"
                                    outerRadius={105}
                                    innerRadius={55}
                                    paddingAngle={3}
                                    stroke="none"
                                >
                                    {categoryChartData.map((entry, index) => (
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

                {/* Monthly Bar Chart */}
                <div className="chart-container dashboard-chart">
                    <h2>Monthly Expenses</h2>

                    <p className="chart-subtitle">
                        Your spending over time
                    </p>

                    {monthlyData.length === 0 ? (
                        <p className="empty-state">
                            No expenses found for this period.
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

            </div>

            {/* Category Spending Table */}
            <div className="category-spending">
                <h2>Category-wise Spending Details</h2>

                {categoryChartData.length === 0 ? (
                    <p>No spending details available.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Total Spent</th>
                            </tr>
                        </thead>

                        <tbody>
                            {categoryChartData.map((category) => (
                                <tr key={category.name}>
                                    <td>{category.name}</td>
                                    <td>{formatCurrency(category.value)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

        </div>
    );
}

export default Analytics;
