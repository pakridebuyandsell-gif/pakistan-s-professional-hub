import { createServerFn } from "@tanstack/react-start";
import { createHash } from "crypto";

type Account = "jobs" | "services";

function fromCloudinaryUrl(raw: string | undefined) {
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "cloudinary:") return null;
    return {
      cloudName: parsed.hostname,
      apiKey: decodeURIComponent(parsed.username),
      apiSecret: decodeURIComponent(parsed.password),
    };
  } catch {
    return null;
  }
}

function requireCreds(values: { cloudName?: string; apiKey?: string; apiSecret?: string }, account: Account) {
  const cloudName = values.cloudName?.trim();
  const apiKey = values.apiKey?.trim();
  const apiSecret = values.apiSecret?.trim();
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(`Cloudinary ${account} credentials are missing`);
  }
  return { cloudName, apiKey, apiSecret };
}

function creds(account: Account) {
  const singleUrl = fromCloudinaryUrl(process.env.CLOUDINARY_URL);
  if (account === "services") {
    const servicesUrl = fromCloudinaryUrl(process.env.CLOUDINARY_SERVICES_URL);
    return requireCreds({
      cloudName: process.env.CLOUDINARY_SERVICES_CLOUD_NAME ?? servicesUrl?.cloudName ?? singleUrl?.cloudName,
      apiKey: process.env.CLOUDINARY_SERVICES_API_KEY ?? process.env.SERVICES_API_KEY ?? servicesUrl?.apiKey ?? singleUrl?.apiKey,
      apiSecret: process.env.CLOUDINARY_SERVICES_API_SECRET ?? process.env.SERVICES_API_SECRET ?? servicesUrl?.apiSecret ?? singleUrl?.apiSecret,
    }, account);
  }
  return requireCreds({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? singleUrl?.cloudName,
    apiKey: process.env.CLOUDINARY_API_KEY ?? process.env.API_KEY ?? singleUrl?.apiKey,
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? process.env.API_SECRET ?? singleUrl?.apiSecret,
  }, account);
}

/** Sign an upload from the browser. API secret never leaves the server. */
export const signCloudinaryUpload = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    const d = (data ?? {}) as { folder?: string; account?: Account };
    return {
      folder: typeof d.folder === "string" && d.folder ? d.folder : "worqgo",
      account: d.account === "services" ? "services" : "jobs" as Account,
    };
  })
  .handler(async ({ data }) => {
    const { cloudName, apiKey, apiSecret } = creds(data.account);
    const timestamp = Math.floor(Date.now() / 1000);
    const toSign = `folder=${data.folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = createHash("sha1").update(toSign).digest("hex");
    return { cloudName, apiKey, timestamp, folder: data.folder, signature };
  });

/**
 * Delete an asset from Cloudinary by public_id.
 * Called when a user deletes their job/service post so the media is cleaned up.
 */
export const deleteCloudinaryAsset = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    const d = (data ?? {}) as { publicId?: string; account?: Account };
    if (!d.publicId || typeof d.publicId !== "string") {
      throw new Error("publicId is required");
    }
    return {
      publicId: d.publicId,
      account: d.account === "services" ? "services" : "jobs" as Account,
    };
  })
  .handler(async ({ data }) => {
    const { cloudName, apiKey, apiSecret } = creds(data.account);
    const timestamp = Math.floor(Date.now() / 1000);
    // Cloudinary signed destroy: sign public_id + timestamp
    const toSign = `public_id=${data.publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = createHash("sha1").update(toSign).digest("hex");

    const fd = new FormData();
    fd.append("public_id", data.publicId);
    fd.append("timestamp", String(timestamp));
    fd.append("api_key", apiKey);
    fd.append("signature", signature);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: "POST",
      body: fd,
    });
    const json = (await res.json().catch(() => ({}))) as { result?: string };
    return { ok: json.result === "ok" || json.result === "not found", result: json.result ?? "unknown" };
  });
