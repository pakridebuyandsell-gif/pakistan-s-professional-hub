/**
 * Map raw Firebase auth error codes/messages to friendly, professional text.
 * Also passes through app-thrown Errors (like role-conflict messages) as-is.
 */
export function friendlyAuthError(err: unknown): string {
  if (!err) return "Kuch ghalat ho gaya. Dobara try karein.";

  // App-thrown errors (e.g. role conflict) — keep their message.
  const raw =
    (typeof err === "object" && err !== null && "code" in err && typeof (err as { code: unknown }).code === "string"
      ? (err as { code: string }).code
      : "") ||
    (err instanceof Error ? err.message : String(err));

  const code = raw.toLowerCase();

  if (code.includes("auth/invalid-credential") || code.includes("auth/wrong-password") || code.includes("auth/invalid-login-credentials")) {
    return "Email ya password ghalat hai. Dobara check karke try karein.";
  }
  if (code.includes("auth/user-not-found")) {
    return "Is email par koi account nahi mila. Pehle account banayein.";
  }
  if (code.includes("auth/email-already-in-use")) {
    return "Yeh email pehle se registered hai. Login karein ya password reset karein.";
  }
  if (code.includes("auth/weak-password")) {
    return "Password kamzor hai — kam se kam 6 characters use karein.";
  }
  if (code.includes("auth/invalid-email")) {
    return "Email ka format sahi nahi hai.";
  }
  if (code.includes("auth/too-many-requests")) {
    return "Bohat ziyada koshishein. Kuch der baad dobara try karein ya password reset karein.";
  }
  if (code.includes("auth/network-request-failed")) {
    return "Internet connection issue. Apna network check karke dobara try karein.";
  }
  if (code.includes("auth/popup-closed-by-user") || code.includes("auth/cancelled-popup-request")) {
    return "Sign-in cancel ho gaya. Dobara try karein.";
  }
  if (code.includes("auth/popup-blocked")) {
    return "Browser ne popup block kar diya. Popups allow karke dobara try karein.";
  }
  if (code.includes("auth/unauthorized-domain")) {
    return "Yeh domain Firebase mein authorized nahi hai. Admin se contact karein.";
  }
  if (code.includes("auth/user-disabled")) {
    return "Yeh account disable kiya gaya hai. Support se rabta karein.";
  }

  // App-thrown message (already user-friendly Urdu from local-store etc.)
  if (err instanceof Error && !err.message.toLowerCase().startsWith("firebase:")) {
    return err.message;
  }
  // Unknown — include the raw code so we can diagnose instead of a blind fallback.
  const shown = raw.replace(/^Firebase:\s*/i, "").trim();
  return shown ? `Sign-in mein masla: ${shown}` : "Sign-in mein masla aa gaya. Dobara try karein.";
}

