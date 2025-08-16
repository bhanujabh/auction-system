import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { auctionAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import socketService from "../../services/socket";
import { formatDistanceToNow } from "date-fns";

const AuctionDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState("");
  const [bidding, setBidding] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAuction();
  }, [id]);

  useEffect(() => {
    if (!auction || !isAuthenticated) return;

    // Join auction room
    socketService.joinAuction(id);

    // Listen for real-time updates
    socketService.on("bid_placed", (data) => {
      if (data.auctionId === id) {
        setAuction((prev) => ({
          ...prev,
          currentHighestBid: data.amount,
          winnerId: data.bidderId,
        }));
      }
    });

    socketService.on("auction_ended", (data) => {
      if (data.auctionId === id) {
        setAuction((prev) => ({
          ...prev,
          status: "ended",
        }));
      }
    });

    return () => {
      socketService.leaveAuction(id);
    };
  }, [id, auction, isAuthenticated]);

  useEffect(() => {
    if (!auction || auction.status !== "active") return;

    const timer = setInterval(() => {
      const endTime = new Date(
        new Date(auction.goLiveDatetime).getTime() +
          auction.durationMinutes * 60000
      );
      const now = new Date();
      const remaining = endTime - now;

      if (remaining <= 0) {
        setTimeLeft("Auction Ended");
        clearInterval(timer);
      } else {
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor(
          (remaining % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [auction]);

  const fetchAuction = async () => {
    try {
      setLoading(true);
      const response = await auctionAPI.getById(id);
      setAuction(response.data);

      // Set initial bid amount
      const minBid =
        parseFloat(response.data.currentHighestBid) +
        parseFloat(response.data.bidIncrement);
      setBidAmount(minBid.toFixed(2));
    } catch (error) {
      console.error("Failed to fetch auction:", error);
      setError("Failed to load auction");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError("Please login to place a bid");
      return;
    }

    try {
      setBidding(true);
      setError("");

      await auctionAPI.placeBid(id, { amount: parseFloat(bidAmount) });

      // Update minimum bid amount
      const newMinBid =
        parseFloat(bidAmount) + parseFloat(auction.bidIncrement);
      setBidAmount(newMinBid.toFixed(2));
    } catch (error) {
      setError(error.response?.data?.error || "Failed to place bid");
    } finally {
      setBidding(false);
    }
  };

  const canBid = () => {
    return (
      isAuthenticated &&
      auction &&
      auction.status === "active" &&
      auction.sellerId !== user?.id &&
      timeLeft !== "Auction Ended"
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading auction...</div>;
  }

  if (error && !auction) {
    return <div className="text-center py-8 text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Auction Image */}
        <div>
          {auction.imageUrl ? (
            <img
              src={auction.imageUrl}
              alt={auction.itemName}
              className="w-full h-96 object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">No image available</span>
            </div>
          )}
        </div>

        {/* Auction Details */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{auction.itemName}</h1>

          <div
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${
              auction.status === "active"
                ? "bg-green-100 text-green-800"
                : auction.status === "ended"
                ? "bg-yellow-100 text-yellow-800"
                : auction.status === "completed"
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {auction.status.toUpperCase()}
          </div>

          <p className="text-gray-600 mb-6">{auction.description}</p>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between py-2 border-b">
              <span className="font-medium">Current Highest Bid:</span>
              <span className="text-2xl font-bold text-green-600">
                ${auction.currentHighestBid}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b">
              <span>Starting Price:</span>
              <span>${auction.startingPrice}</span>
            </div>

            <div className="flex justify-between py-2 border-b">
              <span>Bid Increment:</span>
              <span>${auction.bidIncrement}</span>
            </div>

            <div className="flex justify-between py-2 border-b">
              <span>Seller:</span>
              <span>{auction.seller?.name}</span>
            </div>

            {auction.status === "active" && (
              <div className="flex justify-between py-2 border-b">
                <span>Time Remaining:</span>
                <span className="text-red-600 font-bold">{timeLeft}</span>
              </div>
            )}
          </div>

          {/* Bidding Form */}
          {canBid() && (
            <form onSubmit={handlePlaceBid} className="space-y-4">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Bid Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={
                    parseFloat(auction.currentHighestBid) +
                    parseFloat(auction.bidIncrement)
                  }
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Minimum bid: $
                  {(
                    parseFloat(auction.currentHighestBid) +
                    parseFloat(auction.bidIncrement)
                  ).toFixed(2)}
                </p>
              </div>

              <button
                type="submit"
                disabled={bidding}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-md font-medium"
              >
                {bidding ? "Placing Bid..." : "Place Bid"}
              </button>
            </form>
          )}

          {!isAuthenticated && auction.status === "active" && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              Please{" "}
              <a href="/login" className="underline">
                login
              </a>{" "}
              to place a bid
            </div>
          )}

          {auction.sellerId === user?.id && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
              This is your auction
            </div>
          )}
        </div>
      </div>

      {/* Bid History */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Recent Bids</h2>

        {auction.bids && auction.bids.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bidder
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auction.bids.map((bid, index) => (
                  <tr key={bid.id} className={index === 0 ? "bg-green-50" : ""}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="font-medium">
                          {bid.bidder?.name || "Anonymous"}
                          {index === 0 && (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Highest
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-lg font-semibold">
                        ${bid.amount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDistanceToNow(new Date(bid.createdAt), {
                        addSuffix: true,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No bids placed yet
          </div>
        )}
      </div>
    </div>
  );
};

export default AuctionDetail;
