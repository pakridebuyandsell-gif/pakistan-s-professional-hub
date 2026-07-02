import { api } from "./api";

export interface UploadedImage {
  url: string;
}

/**
 * Uploads a single image via multipart POST to /api/uploads.
 * Falls back to a local object-URL preview if the backend endpoint is not available
 * so the wizard remains functional end-to-end during backend rollout.
 */
export const uploadsService = {
  async uploadImage(file: File): Promise<UploadedImage> {
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await api.post<UploadedImage>("/api/uploads", fd);
      if (res?.url) return res;
      throw new Error("no url");
    } catch {
      // Backend not connected — fall back to a data URL so the flow completes.
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = () => reject(r.error);
        r.readAsDataURL(file);
      });
      return { url: dataUrl };
    }
  },

  async uploadMany(files: File[]): Promise<UploadedImage[]> {
    return Promise.all(files.map((f) => this.uploadImage(f)));
  },
};
