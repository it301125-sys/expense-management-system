
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./AddExpense.css";

function AddExpense() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        amount: "",
        category: "",
        description: "",
        date: new Date().toISOString().split("T")[0]
    });

    const [categories, setCategories] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const response = await API.get("/categories", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setCategories(response.data);
            } catch{
                setMessage("Failed to load categories.");
            }
        };

        fetchCategories();
    }, [navigate]);

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

            if (!/^\d+(\.\d{1,2})?$/.test(formData.amount)) {
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
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        setLoading(true);

        try {
            await API.post("/expenses", formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setMessage("Expense added successfully!");

            setTimeout(() => {
                navigate("/dashboard");
            }, 1000);

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Failed to add expense. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-expense-container">
            <form className="add-expense-form" onSubmit={handleSubmit}>
                <h1>Add New Expense</h1>
                <p>Enter the details of your expense.</p>

                <label>Expense Title</label>
                <input
                    type="text"
                    name="title"
                    placeholder="Example: Groceries"
                    value={formData.title}
                    onChange={handleChange}
                    required
                />

                <label>Amount (₹)</label>
                <input
                    type="number"
                    name="amount"
                    placeholder="Enter amount"
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

                    {categories.map((category) => (
                        <option
                            key={category._id}
                            value={category.name}
                        >
                            {category.name}
                        </option>
                    ))}
                </select>

                {categories.length === 0 && (
                    <p>No categories found. Please add a category first.</p>
                )}

                <label>Description</label>
                <textarea
                    name="description"
                    placeholder="Enter a short description"
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

                <button type="submit" disabled={loading}>
                    {loading ? "Adding Expense..." : "Add Expense"}
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

export default AddExpense;
