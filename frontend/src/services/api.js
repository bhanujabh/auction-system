import axios from "axios";

const API_URL =
  process.env.NODE_ENV === "production"
    ? window.location.origin
    : "http://localhost:3000";

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  getMe: () => api.get("/auth/me"),
};

// Auction API
export const auctionAPI = {
  create: (auctionData) => api.post("/auctions", auctionData),
  getAll: (params) => api.get("/auctions", { params }),
  getById: (id) => api.get(`/auctions/${id}`),
  placeBid: (id, bidData) => api.post(`/auctions/${id}/bids`, bidData),
  acceptBid: (id) => api.post(`/auctions/${id}/accept`),
  rejectBid: (id) => api.post(`/auctions/${id}/reject`),
  counterOffer: (id, offerData) =>
    api.post(`/auctions/${id}/counter-offer`, offerData),
};

export default api;
