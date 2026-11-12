
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import "./AddExpense.css";

function EditExpense() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        amount: "",
        category: "",
        description: "",
        date: ""
    });

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    navigate("/login");
                    return;
                }

                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                };

                // Fetch existing expense and custom categories
                const [expenseResponse, categoryResponse] = await Promise.all([
                    API.get("/expenses", config),
                    API.get("/categories", config)
                ]);

                setCategories(categoryResponse.data);

                const expense = expenseResponse.data.find(
                    (item) => item._id === id
                );

                if (!expense) {
                    setMessage("Expense not found.");
                    return;
                }

                setFormData({
                    title: expense.title,
                    amount: expense.amount,
                    category: expense.category,
                    description: expense.description || "",
                    date: new Date(expense.date)
                        .toISOString()
                        .split("T")[0]
                });

            } catch (error) {
                setMessage(
                    error.response?.data?.message ||
                    "Failed to load expense."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // Validate expense title
    if (!formData.title.trim()) {
        setMessage("Please enter an expense title.");
        return;
    }

    if (formData.title.trim().length > 50) {
        setMessage("Expense title cannot exceed 50 characters.");
        return;
    }

    // Validate amount
    if (!formData.amount || Number(formData.amount) <= 0) {
        setMessage("Amount must be greater than zero.");
        return;
    }

    if (!Number.isFinite(Number(formData.amount))) {
        setMessage("Please enter a valid amount.");
        return;
    }

    if (!/^\d+(\.\d{1,2})?$/.test(String(formData.amount))) {
        setMessage("Amount can have a maximum of 2 decimal places.");
        return;
    }

    // Validate category
    if (!formData.category) {
        setMessage("Please select a category.");
        return;
    }

    // Validate date
    if (!formData.date) {
        setMessage("Please select an expense date.");
        return;
    }

    const today = new Date();

const todayString = `${today.getFullYear()}-${String(
    today.getMonth() + 1
).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

if (formData.date > todayString) {
    setMessage("Expense date cannot be in the future.");
    return;
}

    try {
        const token = localStorage.getItem("token");

            await API.put(`/expenses/${id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setMessage("Expense updated successfully!");

            setTimeout(() => {
                navigate("/dashboard");
            }, 1000);

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Failed to update expense."
            );
        }
    };

    if (loading) {
        return <h2>Loading expense...</h2>;
    }

    return (
        <div className="add-expense-container">
            <form className="add-expense-form" onSubmit={handleSubmit}>
                <h1>Edit Expense</h1>
                <p>Update your expense details.</p>

                <label>Expense Title</label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    maxLength="50"
                    required
                />

                <label>Amount (₹)</label>
                <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e") {
                            e.preventDefault();
                        }
                    }}
                    required
                />

                <label>Category</label>
                <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Category</option>

                    {formData.category &&
                        !categories.some(
                            (category) => category.name === formData.category
                        ) && (
                            <option value={formData.category}>
                                {formData.category} (existing)
                            </option>
                        )}

                    {categories.map((category) => (
                        <option
                            key={category._id}
                            value={category.name}
                        >
                            {category.name}
                        </option>
                    ))}
                </select>

                <label>Description</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                />

                <label>Date</label>
                <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                />

                <button type="submit">
                    Update Expense
                </button>

                {message && (
                    <p className="expense-message">{message}</p>
                )}

                <button
                    type="button"
                    className="back-button"
                    onClick={() => navigate("/dashboard")}
                >
                    Back to Dashboard
                </button>
            </form>
        </div>
    );
}

export default EditExpense;
