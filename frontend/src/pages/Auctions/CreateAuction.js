import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auctionAPI } from "../../services/api";

const CreateAuction = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    startingPrice: "",
    bidIncrement: "",
    goLiveDatetime: "",
    durationMinutes: 60,
    imageUrl: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate datetime is in future
      const goLiveDate = new Date(formData.goLiveDatetime);
      if (goLiveDate <= new Date()) {
        throw new Error("Go-live date must be in the future");
      }

      const response = await auctionAPI.create({
        ...formData,
        startingPrice: parseFloat(formData.startingPrice),
        bidIncrement: parseFloat(formData.bidIncrement),
        durationMinutes: parseInt(formData.durationMinutes),
      });

      navigate(`/auction/${response.data.id}`);
    } catch (error) {
      setError(
        error.response?.data?.error ||
          error.message ||
          "Failed to create auction"
      );
    } finally {
      setLoading(false);
    }
  };

  // Get current datetime for min attribute
  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Create New Auction</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Item Name *
          </label>
          <input
            type="text"
            name="itemName"
            value={formData.itemName}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Starting Price ($) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              name="startingPrice"
              value={formData.startingPrice}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bid Increment ($) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              name="bidIncrement"
              value={formData.bidIncrement}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Go Live Date & Time *
            </label>
            <input
              type="datetime-local"
              name="goLiveDatetime"
              value={formData.goLiveDatetime}
              min={getCurrentDateTime()}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes) *
            </label>
            <select
              name="durationMinutes"
              value={formData.durationMinutes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="240">4 hours</option>
              <option value="480">8 hours</option>
              <option value="1440">24 hours</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image URL (optional)
          </label>
          <input
            type="url"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md"
          >
            {loading ? "Creating..." : "Create Auction"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAuction;
