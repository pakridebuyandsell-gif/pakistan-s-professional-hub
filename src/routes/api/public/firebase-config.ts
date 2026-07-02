import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

function cleanApiKey(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export const Route = createFileRoute("/api/public/firebase-config")({
  server: {
    handlers: {
      GET: async () => {
        const apiKey = cleanApiKey(process.env.GOOGLE_API_KEY ?? process.env.VITE_FIREBASE_API_KEY);

        if (!apiKey) {
          return Response.json({ message: "Firebase config is not available" }, { status: 404 });
        }

        return Response.json(
          {
            apiKey,
            authDomain: "worqgo.firebaseapp.com",
            projectId: "worqgo",
            storageBucket: "worqgo.firebasestorage.app",
            messagingSenderId: "299553115323",
            appId: "1:299553115323:web:4414b06a37f484b555ed9e",
            measurementId: "G-6X65JW3M3C",
          },
          { headers: { "Cache-Control": "no-store" } },
        );
      },
    },
  },
});
