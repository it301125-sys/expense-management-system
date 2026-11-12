import { BrowserRouter, Routes, Route } from "react-router-dom";
import EditExpense from "./pages/EditExpense";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddExpense from "./pages/AddExpense";
import Budget from "./pages/Budget";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import Categories from "./pages/Categories";
import DashboardLayout from "./components/DashboardLayout";
import Transactions from "./pages/Transactions";
import Analytics from "./pages/Analytics";
function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Public Routes */}
                <Route path="/" element={<Register />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<DashboardLayout />}>

                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/transactions" element={<Transactions />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/add-expense" element={<AddExpense />} />
                        <Route path="/edit-expense/:id" element={<EditExpense />} />
                        <Route path="/budget" element={<Budget />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/change-password" element={<ChangePassword />} />
                        <Route path="/categories" element={<Categories />} />

                    </Route>
                </Route>

            </Routes>
        </BrowserRouter>
    );
}

export default App;
