
import "../pages/Dashboard.css";
import {
    NavLink,
    Outlet,
    useLocation,
    useNavigate
} from "react-router-dom";
import { useEffect } from "react";

function DashboardLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.hash === "#recent-expenses") {
            document.getElementById("recent-expenses")?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const isTransactions =
        location.pathname === "/dashboard" &&
        location.hash === "#recent-expenses";

    const navigationGroups = [
        {
            title: "OVERVIEW",
            items: [
                { name: "Dashboard", path: "/dashboard", icon: "⌂" },
                { name: "Analytics", path: "/analytics", icon: "▥" }
            ]
        },
        {
            title: "MONEY MANAGEMENT",
            items: [
                { name: "Transactions", path: "/transactions", icon: "⇄" },
                { name: "Categories", path: "/categories", icon: "▦" },
                { name: "Budget", path: "/budget", icon: "◎" }
            ]
        },
        {
            title: "ACCOUNT",
            items: [
                { name: "My Profile", path: "/profile", icon: "♙" },
                { name: "Change Password", path: "/change-password", icon: "⌑" }
            ]
        }
    ];

    return (
        <div className="dashboard-layout">

            <aside className="dashboard-sidebar">

                {/* Brand */}
                <div className="sidebar-brand">
    <div className="brand-icon">E</div>

    <div className="brand-text">
        <h2>Expenso</h2>
        <p>PERSONAL FINANCE</p>
    </div>
</div>

                {/* Navigation */}
                <nav className="sidebar-navigation">

                    {navigationGroups.map((group) => (
                        <div className="sidebar-group" key={group.title}>

                            <p className="sidebar-label">
                                {group.title}
                            </p>

                            <div className="sidebar-menu">

                                {group.items.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        end={item.path === "/dashboard"}
                                        className={({ isActive }) => {
                                            const active =
                                                item.path === "/transactions"
                                                    ? isTransactions ||
                                                      location.pathname === "/transactions"
                                                    : isActive;

                                            return `sidebar-link ${active ? "active" : ""}`;
                                        }}
                                    >
                                        <span className="sidebar-icon">
                                            {item.icon}
                                        </span>

                                        <span className="sidebar-link-text">
                                            {item.name}
                                        </span>

                                        <span className="sidebar-active-indicator" />
                                    </NavLink>
                                ))}

                            </div>
                        </div>
                    ))}

                </nav>

                {/* Bottom section */}
                <div className="sidebar-bottom">

                    <div className="sidebar-help">
                        <span className="help-icon">✦</span>
                        <div>
                            <strong>Manage wisely</strong>
                            <p>Stay on top of your finances.</p>
                        </div>
                    </div>

                    <button
                        className="sidebar-link logout-link"
                        onClick={handleLogout}
                    >
                        <span className="sidebar-icon">↪</span>
                        <span className="sidebar-link-text">Logout</span>
                    </button>

                    <p className="sidebar-version">EXPENSO • FINANCE MANAGER</p>

                </div>

            </aside>

            <main className="dashboard-main">
                <Outlet />
            </main>

        </div>
    );
}

export default DashboardLayout;
