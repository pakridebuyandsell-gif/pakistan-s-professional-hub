import { signCloudinaryUpload, deleteCloudinaryAsset } from "@/lib/cloudinary-sign.functions";

export type CloudinaryAccount = "jobs" | "services";

export interface UploadedImage {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  account: CloudinaryAccount;
}

async function uploadOne(file: File, account: CloudinaryAccount, folder: string): Promise<UploadedImage> {
  const sig = await signCloudinaryUpload({ data: { folder, account } });
  const fd = new FormData();
  fd.append("file", file);
  fd.append("api_key", sig.apiKey);
  fd.append("timestamp", String(sig.timestamp));
  fd.append("folder", sig.folder);
  fd.append("signature", sig.signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Cloudinary upload failed: ${res.status} ${text}`);
  }
  const json = (await res.json()) as {
    secure_url: string; public_id: string;
    width: number; height: number; format: string; bytes: number;
  };
  return {
    url: json.secure_url,
    publicId: json.public_id,
    width: json.width,
    height: json.height,
    format: json.format,
    bytes: json.bytes,
    account,
  };
}

export const uploadsService = {
  /** Upload to the JOBS Cloudinary account (default folder `worqgo/jobs`). */
  uploadJobImage(file: File, folder = "worqgo/jobs") {
    return uploadOne(file, "jobs", folder);
  },
  uploadJobImages(files: File[], folder = "worqgo/jobs") {
    return Promise.all(files.map((f) => uploadOne(f, "jobs", folder)));
  },

  /** Upload to the SERVICES Cloudinary account (default folder `worqgo/services`). */
  uploadServiceImage(file: File, folder = "worqgo/services") {
    return uploadOne(file, "services", folder);
  },
  uploadServiceImages(files: File[], folder = "worqgo/services") {
    return Promise.all(files.map((f) => uploadOne(f, "services", folder)));
  },

  /** Legacy alias — routes to the jobs account by default. */
  uploadImage(file: File, folder = "worqgo/jobs") {
    return uploadOne(file, "jobs", folder);
  },
  uploadMany(files: File[], folder = "worqgo/jobs") {
    return Promise.all(files.map((f) => uploadOne(f, "jobs", folder)));
  },

  /** Delete a single asset from Cloudinary. Never throws — logs and continues. */
  async deleteAsset(publicId: string, account: CloudinaryAccount) {
    try {
      return await deleteCloudinaryAsset({ data: { publicId, account } });
    } catch (err) {
      console.warn("Cloudinary delete failed", publicId, err);
      return { ok: false, result: "error" };
    }
  },

  /** Delete many assets in parallel. Safe to call with mixed accounts. */
  async deleteAssets(items: Array<{ publicId: string; account: CloudinaryAccount }>) {
    return Promise.all(items.map((i) => this.deleteAsset(i.publicId, i.account)));
  },
};
