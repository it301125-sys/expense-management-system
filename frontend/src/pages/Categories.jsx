import { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import "./Categories.css";
function Categories() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryName, setCategoryName] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    const config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };

    // Fetch categories when the page loads
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
    } finally {
        setLoading(false);
    }
}, []);

    useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
}, [fetchCategories]);

    // Add a new category
    const handleAddCategory = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!categoryName.trim()) {
            setError("Please enter a category name");
            return;
        }

        try {
            const response = await API.post(
                "/categories",
                { name: categoryName },
                config
            );

            setMessage(response.data.message);
            setCategoryName("");

            fetchCategories();

        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to add category"
            );
        }
    };
    // Delete a category
    const handleDeleteCategory = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this category?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            const response = await API.delete(
                `/categories/${id}`,
                config
            );

            setMessage(response.data.message);
            setError("");

            // Update the category list
            setCategories((previousCategories) =>
                previousCategories.filter(
                    (category) => category._id !== id
                )
            );

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to delete category"
            );
        }
    };
    return (
        <div className="categories-container">
            <h2>Manage Categories</h2>
            <button
                type="button"
                className="categories-back-button"
                onClick={() => navigate("/dashboard")}
            >
                Back to Dashboard
            </button>
            <form className="categories-form" onSubmit={handleAddCategory}>
                <input
                    type="text"
                    placeholder="Enter category name"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                />

                <button type="submit" >
                    Add Category
                </button>
            </form>

            {message && (
                <p className="categories-message">{message}</p>
            )}

            {error && (
                <p className="categories-error">{error}</p>
            )}

            <h3>Your Categories ({categories.length})</h3>

            {loading ? (
                <p>Loading categories...</p>
            ) : categories.length === 0 ? (
                <p>No categories found. Add your first category!</p>
            ) : (
                <ul className="category-list">
    {categories.map((category) => (
        <li key={category._id} className="category-item">
            <div className="category-info">
                <span>{category.name}</span>

                {category.isDefault && (
                    <span className="default-category-label">
                        Default
                    </span>
                )}
            </div>

            {!category.isDefault && (
                <button
                    className="category-delete-button"
                    onClick={() => handleDeleteCategory(category._id)}
                >
                    Delete
                </button>
            )}
        </li>
    ))}
</ul>
    )}
        </div>
    );
}
export default Categories;