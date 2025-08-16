import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import socketService from "../services/socket";

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    const addNotification = (message, type = "info") => {
      const id = Date.now();
      setNotifications((prev) => [...prev, { id, message, type }]);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.filter((notif) => notif.id !== id));
      }, 5000);
    };

    // Socket event listeners
    socketService.on("bid_placed", (data) => {
      addNotification(
        `New bid placed: ${data.amount} by ${data.bidderName}`,
        "success"
      );
    });

    socketService.on("outbid_notification", (data) => {
      addNotification(
        `You have been outbid! New bid: ${data.newBidAmount}`,
        "warning"
      );
    });

    socketService.on("auction_ended", (data) => {
      addNotification(`Auction ended! Final bid: ${data.finalBid}`, "info");
    });

    socketService.on("auction_completed", (data) => {
      addNotification("Auction completed successfully!", "success");
    });

    socketService.on("counter_offer_received", (data) => {
      addNotification(`Counter offer received: ${data.counterAmount}`, "info");
    });

    return () => {
      socketService.off("bid_placed");
      socketService.off("outbid_notification");
      socketService.off("auction_ended");
      socketService.off("auction_completed");
      socketService.off("counter_offer_received");
    };
  }, [isAuthenticated]);

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  if (!notifications.length) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-lg shadow-lg max-w-sm ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : notification.type === "warning"
              ? "bg-yellow-500 text-black"
              : notification.type === "error"
              ? "bg-red-500 text-white"
              : "bg-blue-500 text-white"
          }`}
        >
          <div className="flex justify-between items-start">
            <p className="text-sm">{notification.message}</p>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-2 text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notification;
