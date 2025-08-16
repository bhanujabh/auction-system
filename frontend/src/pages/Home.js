import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { auctionAPI } from "../services/api";
import { formatDistanceToNow } from "date-fns";

const AuctionCard = ({ auction }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "ended":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTimeRemaining = () => {
    if (auction.status === "active") {
      const endTime = new Date(
        new Date(auction.goLiveDatetime).getTime() +
          auction.durationMinutes * 60000
      );
      const now = new Date();
      if (endTime > now) {
        return `Ends ${formatDistanceToNow(endTime, { addSuffix: true })}`;
      }
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {auction.imageUrl && (
        <img
          src={auction.imageUrl}
          alt={auction.itemName}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold">{auction.itemName}</h3>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              auction.status
            )}`}
          >
            {auction.status.toUpperCase()}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {auction.description}
        </p>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Current Bid:</span>
            <span className="font-semibold">${auction.currentHighestBid}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Starting Price:</span>
            <span>${auction.startingPrice}</span>
          </div>

          {getTimeRemaining() && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Time Left:</span>
              <span className="text-red-600 font-medium">
                {getTimeRemaining()}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4">
          <Link
            to={`/auction/${auction.id}`}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-center block"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchAuctions();
  }, [filter]);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const params = filter !== "all" ? { status: filter } : {};
      const response = await auctionAPI.getAll(params);
      setAuctions(response.data.auctions);
    } catch (error) {
      console.error("Failed to fetch auctions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading auctions...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Live Auctions</h1>

        <div className="flex space-x-2">
          {["all", "pending", "active", "ended"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {auctions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No auctions found</p>
          <Link
            to="/create-auction"
            className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
          >
            Create First Auction
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
