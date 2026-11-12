
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Dashboard.css";

const getCategoryIcon = (category) => {
    const icons = {
        Food: "🍔",
        Shopping: "🛍️",
        Travel: "✈️",
        Bills: "💡",
        Entertainment: "🎬",
        Healthcare: "🏥",
        Education: "📚",
        Other: "📦"
    };

    return icons[category] || "📁";
};

function Transactions() {
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedDate, setSelectedDate] = useState("all");
    const [sortOrder, setSortOrder] = useState("newest");
    const [currentPage, setCurrentPage] = useState(1);
    const expensesPerPage = 5;
const formatCurrency = (amount) =>
    `₹${Number(amount).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
    const navigate = useNavigate();

    // Fetch expenses
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

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await API.get("/categories", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setCategories(response.data);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    }, []);

    useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchExpenses();
    fetchCategories();
}, [fetchExpenses, fetchCategories]);

    // Delete expense
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this expense?"
        );

        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem("token");

            await API.delete(`/expenses/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setExpenses((previousExpenses) =>
                previousExpenses.filter((expense) => expense._id !== id)
            );

            alert("Expense deleted successfully!");
        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Failed to delete expense."
            );
        }
    };

    // Filter expenses
const filteredExpenses = expenses.filter((expense) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
        (expense.title || "").toLowerCase().includes(search) ||
        (expense.description || "").toLowerCase().includes(search) ||
        (expense.category || "").toLowerCase().includes(search);

    const matchesCategory =
        selectedCategory === "All" ||
        expense.category === selectedCategory;

    // Date filtering
    const expenseDate = new Date(expense.date);
    const today = new Date();

    today.setHours(23, 59, 59, 999);

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    if (selectedDate === "today") {
        // Today only
    } else if (selectedDate === "7days") {
        startDate.setDate(startDate.getDate() - 6);
    } else if (selectedDate === "30days") {
        startDate.setDate(startDate.getDate() - 29);
    } else if (selectedDate === "month") {
        startDate.setDate(1);
    } else if (selectedDate === "year") {
        startDate.setMonth(0, 1);
    }

    const matchesDate =
        selectedDate === "all" ||
        (
            !Number.isNaN(expenseDate.getTime()) &&
            expenseDate >= startDate &&
            expenseDate <= today
        );

    return matchesSearch && matchesCategory && matchesDate;
});
    // Dynamic summary calculations
const totalAmount = filteredExpenses.reduce(
    (total, expense) =>
        total + Number(expense.amount || 0),
    0
);

const averageExpense = filteredExpenses.length > 0
    ? totalAmount / filteredExpenses.length
    : 0;
    // Sort expenses
    const sortedExpenses = [...filteredExpenses].sort((a, b) => {
        if (sortOrder === "newest") {
            return new Date(b.date) - new Date(a.date);
        }

        if (sortOrder === "oldest") {
            return new Date(a.date) - new Date(b.date);
        }

        if (sortOrder === "highest") {
            return Number(b.amount) - Number(a.amount);
        }

        if (sortOrder === "lowest") {
            return Number(a.amount) - Number(b.amount);
        }

        return 0;
    });

    // Pagination
    const totalPages = Math.ceil(
        sortedExpenses.length / expensesPerPage
    );

    const indexOfLastExpense = currentPage * expensesPerPage;
    const indexOfFirstExpense = indexOfLastExpense - expensesPerPage;

    const currentExpenses = sortedExpenses.slice(
        indexOfFirstExpense,
        indexOfLastExpense
    );

    // Export expenses to CSV
    const exportToCSV = () => {
        if (filteredExpenses.length === 0) {
            alert("No expenses available to export!");
            return;
        }

        const headers = [
            "Title",
            "Amount",
            "Category",
            "Description",
            "Date"
        ];

        const rows = filteredExpenses.map((expense) => [
            expense.title,
            expense.amount,
            expense.category,
            expense.description || "",
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
        link.download = "expense-report.csv";
        link.click();

        setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    if (loading) {
        return <h2>Loading transactions...</h2>;
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div>
                    <h1>Transactions</h1>
                    <p>View and manage all your expenses.</p>
                </div>
            </header>
            {/* Transaction Summary Cards */}
<div className="dashboard-cards">

    <div className="dashboard-card">
        <div className="card-top">
            <h3>Total Expenses</h3>
            <span className="card-icon purple-icon">₹</span>
        </div>
        <h2>{formatCurrency(totalAmount)}</h2>
        <p className="card-description">Based on current filter</p>
    </div>

    <div className="dashboard-card">
        <div className="card-top">
            <h3>Total Transactions</h3>
            <span className="card-icon blue-icon">▤</span>
        </div>
        <h2>{filteredExpenses.length}</h2>
        <p className="card-description">Matching transactions</p>
    </div>

    <div className="dashboard-card">
        <div className="card-top">
            <h3>Average Expense</h3>
            <span className="card-icon green-icon">↗</span>
        </div>
        <h2>{formatCurrency(averageExpense)}</h2>
        <p className="card-description">Average of matching transactions</p>
    </div>

</div>
            <button
                className="add-expense-button"
                onClick={() => navigate("/add-expense")}
            >
                + Add New Expense
            </button>

            <div className="recent-expenses">
                <h2>All Transactions</h2>

                <p className="expense-count">
                    Showing {sortedExpenses.length === 0
                        ? 0
                        : indexOfFirstExpense + 1}
                    –
                    {Math.min(indexOfLastExpense, sortedExpenses.length)}
                    {" "}of {sortedExpenses.length} transactions
                </p>

                {expenses.length === 0 ? (
    <div className="empty-state">
        <div className="empty-state-icon">💸</div>
        <h3>No transactions yet</h3>
        <p>
            You haven't recorded any expenses.
            Start tracking your spending by adding your first expense.
        </p>
        <button
            className="add-expense-button"
            onClick={() => navigate("/add-expense")}
        >
            + Add Your First Expense
        </button>
    </div>
) : (
                    <>
                        <div className="expense-filters">
                            <input
                                type="text"
                                placeholder="Search expenses..."
                                value={searchTerm}
                                onChange={(e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
}}
                            />

                            <select
                                value={selectedCategory}
                                onChange={(e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
}}
                            >
                                <option value="All">All Categories</option>

                                {categories.map((category) => (
                                    <option
                                        key={category._id}
                                        value={category.name}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            <select
    value={selectedDate}
    onChange={(e) => {
        setSelectedDate(e.target.value);
        setCurrentPage(1);
    }}
>
    <option value="all">All Time</option>
    <option value="today">Today</option>
    <option value="7days">Last 7 Days</option>
    <option value="30days">Last 30 Days</option>
    <option value="month">This Month</option>
    <option value="year">This Year</option>
</select>
                            <select
                                value={sortOrder}
                                onChange={(e) => {
    setSortOrder(e.target.value);
    setCurrentPage(1);
}}
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="highest">Highest Amount</option>
                                <option value="lowest">Lowest Amount</option>
                            </select>
                            <button
                                onClick={() => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedDate("all");
    setSortOrder("newest");
    setCurrentPage(1);
}}
                                className="clear-filters-button"
                            >
                                Clear Filters
                            </button>
                        </div>

                        <button
                            onClick={exportToCSV}
                            className="export-button"
                        >
                            Export Expenses to CSV
                        </button>

                        {filteredExpenses.length === 0 ? (
    <div className="empty-state">
        <div className="empty-state-icon">🔍</div>
        <h3>No matching transactions</h3>
        <p>
            We couldn't find any expenses matching your search
            or selected filters. Try changing your filters.
        </p>
        <button
            className="clear-filters-button"
            onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
                setSelectedDate("all");
                setSortOrder("newest");
                setCurrentPage(1);
            }}
        >
            Clear All Filters
        </button>
    </div>
) : (
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Category</th>
                                            <th>Amount</th>
                                            <th>Date</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {currentExpenses.map((expense) => (
                                            <tr key={expense._id}>
                                                <td>{expense.title}</td>

                                                <td>
                                                    {getCategoryIcon(expense.category)}{" "}
                                                    {expense.category}
                                                </td>

                                                <td>
                                                    ₹{Number(expense.amount).toFixed(2)}
                                                </td>

                                                <td>
                                                    {new Date(
                                                        expense.date
                                                    ).toLocaleDateString()}
                                                </td>

                                                <td>
                                                    <button
                                                        className="edit-button"
                                                        onClick={() =>
                                                            navigate(
                                                                `/edit-expense/${expense._id}`
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        className="delete-button"
                                                        onClick={() =>
                                                            handleDelete(expense._id)
                                                        }
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    onClick={() =>
                                        setCurrentPage((page) =>
                                            Math.max(page - 1, 1)
                                        )
                                    }
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>

                                {Array.from(
                                    { length: totalPages },
                                    (_, index) => index + 1
                                ).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={
                                            currentPage === page
                                                ? "active-page"
                                                : ""
                                        }
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() =>
                                        setCurrentPage((page) =>
                                            Math.min(page + 1, totalPages)
                                        )
                                    }
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default Transactions;
