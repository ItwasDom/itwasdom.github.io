/**
 * Firebase Cloud Functions for Portfolio Email Notifications
 * 
 * Deploy with: firebase deploy --only functions
 * 
 * Environment Variables needed:
 * - GMAIL_EMAIL: Your Gmail address
 * - GMAIL_PASSWORD: Your Gmail app-specific password
 * - ADMIN_EMAIL: Dominic's email
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

// Initialize Firebase Admin SDK
admin.initializeApp();

// Configure nodemailer with Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_PASSWORD,
  },
});

/**
 * Sends email notification when someone likes a photo
 */
exports.sendLikeNotification = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  const { userEmail, userName, photoId } = data;

  try {
    // Get user's email preferences from Firestore
    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(context.auth.uid)
      .get();

    if (!userDoc.exists || !userDoc.data().enableNotifications) {
      console.log("User has notifications disabled or not found");
      return { success: false, reason: "Notifications disabled" };
    }

    // Send email to Dominic
    const mailOptions = {
      from: process.env.GMAIL_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: `❤️ New Like on Your Portfolio!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f0a1a 0%, #1a1a2e 100%); padding: 20px; border-radius: 12px; color: #f0f0f0;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="background: linear-gradient(135deg, #1B16A8 0%, #7C3AED 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0;">You've Got a New Like! 🎉</h2>
          </div>

          <div style="background: rgba(27, 22, 168, 0.1); border: 1px solid rgba(27, 22, 168, 0.2); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0 0 15px 0; line-height: 1.6;">
              <strong>${userName}</strong> (<em>${userEmail}</em>) just liked your photo!
            </p>
            <p style="margin: 0; color: #aaa; font-size: 0.9em;">
              Photo ID: <strong>${photoId}</strong>
            </p>
          </div>

          <div style="background: rgba(27, 22, 168, 0.05); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; color: #bbb; text-align: center;">
              Keep creating amazing content!<br>
              <a href="https://itwasdom.github.io/portfolio/feed.html" style="color: #1B16A8; text-decoration: none; font-weight: bold;">View Your Portfolio</a>
            </p>
          </div>

          <div style="text-align: center; color: #666; font-size: 0.8em; padding-top: 20px; border-top: 1px solid rgba(27, 22, 168, 0.1);">
            <p style="margin: 10px 0;">Powered by Dominic Martinez Portfolio System</p>
          </div>
        </div>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    console.log(`Like notification sent to ${process.env.ADMIN_EMAIL}`);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("Error sending like notification:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Error sending notification"
    );
  }
});

/**
 * Sends email notification when someone follows
 */
exports.sendFollowNotification = functions.https.onCall(
  async (data, context) => {
    // Verify user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    const { userEmail, userName } = data;

    try {
      // Get user's email preferences from Firestore
      const userDoc = await admin
        .firestore()
        .collection("users")
        .doc(context.auth.uid)
        .get();

      if (!userDoc.exists || !userDoc.data().enableNotifications) {
        console.log("User has notifications disabled or not found");
        return { success: false, reason: "Notifications disabled" };
      }

      // Send email to Dominic
      const mailOptions = {
        from: process.env.GMAIL_EMAIL,
        to: process.env.ADMIN_EMAIL,
        subject: `👥 New Follower Alert!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f0a1a 0%, #1a1a2e 100%); padding: 20px; border-radius: 12px; color: #f0f0f0;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="background: linear-gradient(135deg, #1B16A8 0%, #7C3AED 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0;">You Have a New Follower! 🌟</h2>
            </div>

            <div style="background: rgba(27, 22, 168, 0.1); border: 1px solid rgba(27, 22, 168, 0.2); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0 0 15px 0; line-height: 1.6;">
                <strong>${userName}</strong> (<em>${userEmail}</em>) started following you!
              </p>
              <p style="margin: 0; color: #aaa; font-size: 0.9em;">
                Keep your followers engaged with amazing content.
              </p>
            </div>

            <div style="background: rgba(27, 22, 168, 0.05); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0; color: #bbb; text-align: center;">
                Your follower count is growing!<br>
                <a href="https://itwasdom.github.io/portfolio/feed.html" style="color: #1B16A8; text-decoration: none; font-weight: bold;">View Your Portfolio</a>
              </p>
            </div>

            <div style="text-align: center; color: #666; font-size: 0.8em; padding-top: 20px; border-top: 1px solid rgba(27, 22, 168, 0.1);">
              <p style="margin: 10px 0;">Powered by Dominic Martinez Portfolio System</p>
            </div>
          </div>
        `,
      };

      // Send the email
      await transporter.sendMail(mailOptions);

      console.log(`Follow notification sent to ${process.env.ADMIN_EMAIL}`);
      return { success: true, message: "Email sent successfully" };
    } catch (error) {
      console.error("Error sending follow notification:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Error sending notification"
      );
    }
  }
);

/**
 * Cleanup function to delete old notifications
 */
exports.cleanupOldNotifications = functions.pubsub
  .schedule("every day 03:00")
  .timeZone("America/Chicago")
  .onRun(async (context) => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const snapshot = await admin
        .firestore()
        .collection("notifications")
        .where("createdAt", "<", thirtyDaysAgo)
        .get();

      let deleted = 0;
      snapshot.forEach((doc) => {
        doc.ref.delete();
        deleted++;
      });

      console.log(`Deleted ${deleted} old notifications`);
      return null;
    } catch (error) {
      console.error("Error cleaning up notifications:", error);
    }
  });
