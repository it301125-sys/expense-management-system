import { useState } from "react";
import API from "../services/api";
import "./Login.css";
import { useNavigate } from "react-router-dom";
function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);

        try {
            const response = await API.post("/auth/login", formData);

            localStorage.setItem("token", response.data.token);
            navigate("/dashboard");
            setMessage("Login successful!");

            setFormData({
                email: "",
                password: ""
            });

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Login failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h1>Welcome Back!</h1>
                <p>Login to manage your expenses.</p>

                <label>Email Address</label>
                <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />

                <label>Password</label>
                <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>

                {message && (
                    <p className="login-message">{message}</p>
                )}
            </form>
            <p className="login-register-link">
    Don't have an account?
    <span onClick={() => navigate("/")}>
        Register here
    </span>
</p>
        </div>
    );
}

export default Login;