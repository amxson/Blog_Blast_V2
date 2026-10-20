import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

export const googleAuth = {
  async verify(idToken) {
    if (typeof idToken !== "string" || !idToken || idToken.length > 8192) {
      throw Object.assign(new Error("A Firebase ID token is required"), {
        statusCode: 401,
      });
    }
    if (!process.env.FIREBASE_PROJECT_ID) {
      throw Object.assign(new Error("Google sign-in is not configured"), {
        statusCode: 503,
      });
    }
    const app =
      getApps().find((app) => app.name === "blog-auth") ||
      initializeApp(
        { projectId: process.env.FIREBASE_PROJECT_ID },
        "blog-auth",
      );
    const claims = await getAuth(app).verifyIdToken(idToken);
    if (
      !claims.email_verified ||
      claims.firebase?.sign_in_provider !== "google.com"
    ) {
      throw Object.assign(new Error("A verified Google account is required"), {
        statusCode: 401,
      });
    }
    return claims;
  },
};
