/**
 * Firebase Cloud Functions for Portfolio Email Notifications
 *
 * Deploy with: firebase deploy --only functions
 *
 * Environment Variables needed:
 * - GMAIL_EMAIL: Your Gmail address
 * - GMAIL_PASSWORD: Your Gmail app-specific password
 * - ADMIN_EMAIL: Dominic's email
 * - SITE_BASE_URL: (optional) e.g. https://your-domain.example (no trailing slash)
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

const SITE_BASE_URL = (process.env.SITE_BASE_URL || "https://itwasdom.github.io").replace(/\/+$/, "");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_PASSWORD,
  },
});

/**
 * Sends a password reset email with a unique 6-digit PIN
 * Stores the PIN in Firestore for verification
 */
exports.sendPasswordResetPin = functions.https.onCall(async (data, context) => {
  const { email } = data;
  if (!email) {
    throw new functions.https.HttpsError('invalid-argument', 'Email is required');
  }

  // Generate 6-digit PIN
  const pin = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 min expiry

  // Find user by email
  let userRecord;
  try {
    userRecord = await admin.auth().getUserByEmail(email);
  } catch (error) {
    throw new functions.https.HttpsError('not-found', 'No user found with that email');
  }

  // Store PIN in Firestore
  await admin.firestore().collection('passwordResetPins').doc(userRecord.uid).set({
    pin,
    expiresAt,
    used: false
  });

  // Themed email HTML
  const mailOptions = {
    from: process.env.GMAIL_EMAIL,
    to: email,
    subject: 'Password Reset PIN Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f0a1a 0%, #1a1a2e 100%); padding: 24px; border-radius: 16px; color: #f0f0f0;">
        <div style="text-align: center; margin-bottom: 32px;">
          <img src="${SITE_BASE_URL}/image/Headshot.jpg" alt="Dominic Martinez" style="width:80px;height:80px;border-radius:50%;margin-bottom:12px;">
          <h2 style="background: linear-gradient(135deg, #1B16A8 0%, #7C3AED 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0;">Reset Your Password</h2>
        </div>
        <div style="background: rgba(27, 22, 168, 0.1); border: 1px solid rgba(27, 22, 168, 0.2); padding: 20px; border-radius: 8px; margin-bottom: 24px;">
          <p style="margin: 0 0 15px 0; line-height: 1.6;">You requested a password reset. Enter the following PIN on the reset page to continue:</p>
          <div style="font-size:2.2em;font-weight:800;letter-spacing:0.2em;color:#7C3AED;background:#fff;padding:16px 0;border-radius:8px;margin:16px 0;">${pin}</div>
          <p style="margin: 0; color: #aaa; font-size: 0.9em;">This PIN expires in 15 minutes.</p>
        </div>
        <div style="background: rgba(27, 22, 168, 0.05); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; color: #bbb; text-align: center;">If you did not request this, you can ignore this email.</p>
        </div>
        <div style="text-align: center; color: #666; font-size: 0.8em; padding-top: 20px; border-top: 1px solid rgba(27, 22, 168, 0.1);">
          <p style="margin: 10px 0;">Powered by Dominic Martinez Portfolio System</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`Password reset PIN sent to ${email}`);
  return { success: true, message: 'Password reset PIN sent' };
});

/**
 * Verifies the PIN and resets the password
 */
exports.verifyPasswordResetPin = functions.https.onCall(async (data, context) => {
  const { email, pin, newPassword } = data;
  if (!email || !pin || !newPassword) {
    throw new functions.https.HttpsError('invalid-argument', 'Email, PIN, and new password are required');
  }

  // Find user by email
  let userRecord;
  try {
    userRecord = await admin.auth().getUserByEmail(email);
  } catch (error) {
    throw new functions.https.HttpsError('not-found', 'No user found with that email');
  }

  // Get PIN from Firestore
  const pinDoc = await admin.firestore().collection('passwordResetPins').doc(userRecord.uid).get();
  if (!pinDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'No PIN found for this user');
  }
  const pinData = pinDoc.data();
  if (pinData.used) {
    throw new functions.https.HttpsError('failed-precondition', 'PIN already used');
  }
  if (Date.now() > pinData.expiresAt) {
    throw new functions.https.HttpsError('deadline-exceeded', 'PIN expired');
  }
  if (pinData.pin !== pin) {
    throw new functions.https.HttpsError('permission-denied', 'Invalid PIN');
  }

  // Reset password
  await admin.auth().updateUser(userRecord.uid, { password: newPassword });
  await admin.firestore().collection('passwordResetPins').doc(userRecord.uid).update({ used: true });
  return { success: true, message: 'Password reset successful' };
});
/**
 * Registers a new user and stores profile in Firestore
 */
exports.registerUser = functions.https.onCall(async (data, context) => {
  const { email, password, displayName } = data;
  if (!email || !password) {
    throw new functions.https.HttpsError('invalid-argument', 'Email and password are required');
  }
  try {
    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });
    // Store profile in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email,
      displayName,
      createdAt: new Date(),
    });
    return { success: true, uid: userRecord.uid };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Updates user profile and password
 */
exports.updateUserProfile = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  const { displayName, password } = data;
  try {
    const uid = context.auth.uid;
    if (displayName) {
      await admin.auth().updateUser(uid, { displayName });
      await admin.firestore().collection('users').doc(uid).set({ displayName }, { merge: true });
    }
    if (password) {
      await admin.auth().updateUser(uid, { password });
    }
    return { success: true };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
/**
 * Sends password reset email to user
 */
exports.sendPasswordResetEmail = functions.https.onCall(async (data, context) => {
  const { email } = data;
  if (!email) {
    throw new functions.https.HttpsError('invalid-argument', 'Email is required');
  }

  try {
    // Generate a password reset link using Firebase Auth with custom actionCodeSettings
    const actionCodeSettings = {
      url: `${SITE_BASE_URL}/reset-password.html`,
      handleCodeInApp: false
    };
    const resetLink = await admin.auth().generatePasswordResetLink(email, actionCodeSettings);

    // Send email to user
    const mailOptions = {
      from: process.env.GMAIL_EMAIL,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f0a1a 0%, #1a1a2e 100%); padding: 20px; border-radius: 12px; color: #f0f0f0;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="background: linear-gradient(135deg, #1B16A8 0%, #7C3AED 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0;">Reset Your Password</h2>
          </div>
          <div style="background: rgba(27, 22, 168, 0.1); border: 1px solid rgba(27, 22, 168, 0.2); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0 0 15px 0; line-height: 1.6;">
              You requested a password reset. Click the link below to set a new password:
            </p>
            <p style="margin: 0; color: #aaa; font-size: 0.9em;">
              <a href="${resetLink}" style="color: #1B16A8; text-decoration: underline; font-weight: bold;">Reset Password</a>
            </p>
          </div>
          <div style="background: rgba(27, 22, 168, 0.05); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; color: #bbb; text-align: center;">
              If you did not request this, you can ignore this email.
            </p>
          </div>
          <div style="text-align: center; color: #666; font-size: 0.8em; padding-top: 20px; border-top: 1px solid rgba(27, 22, 168, 0.1);">
            <p style="margin: 10px 0;">Powered by Dominic Martinez Portfolio System</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
    return { success: true, message: 'Password reset email sent' };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new functions.https.HttpsError('internal', 'Error sending password reset email');
  }
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
              <a href="${SITE_BASE_URL}/portfolio/feed.html" style="color: #1B16A8; text-decoration: none; font-weight: bold;">View Your Portfolio</a>
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
                <a href="${SITE_BASE_URL}/portfolio/feed.html" style="color: #1B16A8; text-decoration: none; font-weight: bold;">View Your Portfolio</a>
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
