const { createNotification } = require("../services/notificationService");

async function sendNotification(req, res) {
  const { userId, message } = req.body;
  try {
    const notification = await createNotification(userId, message);
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: "Failed to send notification" });
  }
}

module.exports = {
  sendNotification,
};
