import { signCloudinaryUpload } from "@/lib/cloudinary-sign.functions";

export interface UploadedImage {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

/**
 * Uploads an image directly to Cloudinary using a signed upload.
 * The signature is minted server-side so the API secret never leaves the server.
 */
async function uploadToCloudinary(file: File, folder = "worqgo"): Promise<UploadedImage> {
  const sig = await signCloudinaryUpload({ data: { folder } });

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
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
  };
  return {
    url: json.secure_url,
    publicId: json.public_id,
    width: json.width,
    height: json.height,
    format: json.format,
    bytes: json.bytes,
  };
}

export const uploadsService = {
  uploadImage(file: File, folder = "worqgo"): Promise<UploadedImage> {
    return uploadToCloudinary(file, folder);
  },
  uploadMany(files: File[], folder = "worqgo"): Promise<UploadedImage[]> {
    return Promise.all(files.map((f) => uploadToCloudinary(f, folder)));
  },
};
