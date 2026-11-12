
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Budget.css";
function Budget() {
    const [monthlyBudget, setMonthlyBudget] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchBudget = async () => {
            try {
                const response = await API.get("/budget", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setMonthlyBudget(response.data.monthlyBudget);
            } catch{
                setMessage("Unable to load budget.");
            }
        };

        if (token) {
            fetchBudget();
        } else {
            navigate("/login");
        }
    }, [token, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        if (monthlyBudget === "" || Number(monthlyBudget) < 0) {
            setMessage("Please enter a valid budget.");
            return;
        }

        try {
            setLoading(true);

            const response = await API.put(
                "/budget",
                { monthlyBudget: Number(monthlyBudget) },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMonthlyBudget(response.data.monthlyBudget);
            setMessage("Monthly budget updated successfully!");
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Failed to update budget."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="budget-page">
            <h1>Monthly Budget</h1>
            <p>Set your monthly spending limit.</p>

            <form onSubmit={handleSubmit}>
                <label>Monthly Budget (₹)</label>

                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(e.target.value)}
                    placeholder="Enter monthly budget"
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save Budget"}
                </button>
            </form>

            {message && <p>{message}</p>}

            <button
    className="budget-back-button"
    onClick={() => navigate("/dashboard")}
>
    Back to Dashboard
</button>
        </div>
    );
}

export default Budget;
