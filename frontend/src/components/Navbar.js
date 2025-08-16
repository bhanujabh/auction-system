import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold">
            Mini Auction
          </Link>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm">Welcome, {user?.name}</span>
                <Link
                  to="/create-auction"
                  className="bg-blue-500 hover:bg-blue-700 px-3 py-1 rounded"
                >
                  Create Auction
                </Link>
                <Link
                  to="/dashboard"
                  className="bg-blue-500 hover:bg-blue-700 px-3 py-1 rounded"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-700 px-3 py-1 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-blue-500 hover:bg-blue-700 px-3 py-1 rounded"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-green-500 hover:bg-green-700 px-3 py-1 rounded"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
