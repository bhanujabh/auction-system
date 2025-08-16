import React, { createContext, useContext, useReducer, useEffect } from "react";
import { authAPI } from "../services/api";
import socketService from "../services/socket";

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem("token"),
  loading: true,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await authAPI.getMe();
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: {
              user: response.data,
              token,
            },
          });
          socketService.connect(token);
        } catch (error) {
          localStorage.removeItem("token");
          dispatch({ type: "LOGOUT" });
        }
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user, token },
      });

      socketService.connect(token);
      return { success: true };
    } catch (error) {
      dispatch({
        type: "LOGIN_FAILURE",
        payload: error.response?.data?.error || "Login failed",
      });
      return { success: false, error: error.response?.data?.error };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await authAPI.register(userData);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user, token },
      });

      socketService.connect(token);
      return { success: true };
    } catch (error) {
      dispatch({
        type: "LOGIN_FAILURE",
        payload: error.response?.data?.error || "Registration failed",
      });
      return { success: false, error: error.response?.data?.error };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    socketService.disconnect();
    dispatch({ type: "LOGOUT" });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
