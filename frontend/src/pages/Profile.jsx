
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Profile.css";

function Profile() {
    const [profile, setProfile] = useState(null);
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
const [deleting, setDeleting] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await API.get("/auth/me", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setProfile(response.data);
                setName(response.data.name);
            } catch{
                setError("Unable to load profile.");
            }
        };

        if (token) {
            fetchProfile();
        } else {
            navigate("/login");
        }
    }, [token, navigate]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (!name.trim()) {
            setError("Name cannot be empty.");
            return;
        }

        try {
            setLoading(true);

            const response = await API.put(
                "/auth/me",
                { name },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setProfile({
                ...profile,
                name: response.data.name
            });

            setName(response.data.name);
            setMessage("Profile updated successfully!");

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to update profile."
            );
        } finally {
            setLoading(false);
        }
    };
        const handleDeleteAccount = async () => {
        setMessage("");
        setError("");

        if (!deletePassword) {
            setError("Please enter your password to delete your account.");
            return;
        }

        const confirmDelete = window.confirm(
            "Are you sure you want to permanently delete your account? All your expenses and categories will also be deleted. This action cannot be undone."
        );

        if (!confirmDelete) {
            return;
        }

        try {
            setDeleting(true);

            await API.delete(
                "/auth/me",
                {
                    data: {
                        password: deletePassword
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            localStorage.removeItem("token");
            navigate("/register");

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to delete account."
            );
        } finally {
            setDeleting(false);
        }
    };

    if (error && !profile) {
        return <p>{error}</p>;
    }

    if (!profile) {
        return <p>Loading profile...</p>;
    }

    return (
        <div className="profile-container">
            <h1>My Profile</h1>

            <div className="profile-card">

                <div className="profile-avatar">
                    {profile.name.charAt(0).toUpperCase()}
                </div>

                <h2>{profile.name}</h2>

                <div className="profile-details">

                    <form onSubmit={handleUpdate}>
                        <label>Full Name</label>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                        />

                        <p>
                            <strong>Email:</strong> {profile.email}
                        </p>

                        <p>
                            <strong>Monthly Budget:</strong>{" "}
                            ₹{Number(profile.monthlyBudget || 0).toFixed(2)}
                        </p>

                        <button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </form>

                    {message && <p className="profile-success">{message}</p>}
                    {error && <p className="profile-error">{error}</p>}

                </div>
                <div className="profile-actions">
    <button onClick={() => navigate("/change-password")}>
        Change Password
    </button>

    <button onClick={() => navigate("/dashboard")}>
        Back to Dashboard
    </button>
</div>
<div className="delete-account-section">
    <h3>Delete Account</h3>

    <p>
        Permanently delete your account, expenses, and categories.
        This action cannot be undone.
    </p>

    <input
        type="password"
        placeholder="Enter your current password"
        value={deletePassword}
        onChange={(e) => setDeletePassword(e.target.value)}
    />

    <button
        className="delete-account-button"
        onClick={handleDeleteAccount}
        disabled={deleting}
    >
        {deleting ? "Deleting..." : "Delete My Account"}
    </button>
</div>

            </div>
        </div>
    );
}

export default Profile;
