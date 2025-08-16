const { Notification } = require("../models/Notification");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function createNotification(userId, message) {
  try {
    // Save in DB
    const notification = await Notification.create({
      message,
      userId,
    });

    // Publish to Supabase channel
    await supabase.channel("notifications").send({
      type: "broadcast",
      event: "new_notification",
      payload: {
        userId,
        message,
        id: notification.id,
        createdAt: notification.createdAt,
      },
    });

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

module.exports = {
  createNotification,
};
