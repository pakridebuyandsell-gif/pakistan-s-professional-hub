import { createServerFn } from "@tanstack/react-start";
import { createHash } from "crypto";

/**
 * Returns a Cloudinary signature for a signed upload directly from the browser.
 * Keeps API secret server-side; client only receives the signature + timestamp.
 */
export const signCloudinaryUpload = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    const d = (data ?? {}) as { folder?: string };
    return { folder: typeof d.folder === "string" ? d.folder : "worqgo" };
  })
  .handler(async ({ data }) => {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
    const apiKey = process.env.CLOUDINARY_API_KEY!;
    const apiSecret = process.env.CLOUDINARY_API_SECRET!;
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = data.folder;

    // Params to sign — must be alphabetical, joined "key=value&..."
    const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = createHash("sha1").update(toSign).digest("hex");

    return { cloudName, apiKey, timestamp, folder, signature };
  });
