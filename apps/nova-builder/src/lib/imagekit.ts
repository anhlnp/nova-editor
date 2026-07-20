// src/lib/imagekit.ts
// ImageKit server-side SDK wrapper (parallel to r2.ts — do NOT remove r2.ts).
// Activated when IMAGEKIT_PRIVATE_KEY is set.
//
// Env vars required:
//   IMAGEKIT_PUBLIC_KEY   — found in ImageKit dashboard → Developer → API Keys
//   IMAGEKIT_PRIVATE_KEY  — same location (keep secret, server-only)
//   IMAGEKIT_URL_ENDPOINT — e.g. https://ik.imagekit.io/your_imagekit_id

import ImageKit from "imagekit";

// ── Singleton ────────────────────────────────────────────────────────────────

let _client: ImageKit | null = null;

function getClient(): ImageKit {
  if (_client) return _client;

  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !privateKey || !urlEndpoint) {
    throw new Error(
      "ImageKit not configured — set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT"
    );
  }

  _client = new ImageKit({ publicKey, privateKey, urlEndpoint });
  return _client;
}

// ── Types ────────────────────────────────────────────────────────────────────

export type ImageKitUploadResult = {
  fileId: string;   // ImageKit internal ID — use as `key` in NovaAsset
  url: string;      // CDN-ready public URL
  name: string;
  size: number;
  width?: number;
  height?: number;
};

// ── API ──────────────────────────────────────────────────────────────────────

/**
 * Upload a file buffer to ImageKit.
 *
 * @param buffer    Raw file bytes
 * @param fileName  Original filename (used as display name in ImageKit)
 * @param folder    Target folder path, e.g. "/project-abc123/images"
 */
export async function uploadToImageKit(
  buffer: Buffer,
  fileName: string,
  folder: string
): Promise<ImageKitUploadResult> {
  const ik = getClient();

  // ImageKit accepts Buffer directly (base64 internally)
  const result = await ik.upload({
    file: buffer,
    fileName,
    folder,
    useUniqueFileName: true,   // prevents collisions, appends random suffix
    overwriteFile: false,
  });

  return {
    fileId: result.fileId,
    url: result.url,
    name: result.name,
    size: result.size,
    width: result.width ?? undefined,
    height: result.height ?? undefined,
  };
}

/**
 * Delete a file from ImageKit by its fileId.
 * Safe to call even if the file doesn't exist (swallows 404).
 */
export async function deleteFromImageKit(fileId: string): Promise<void> {
  const ik = getClient();
  try {
    await ik.deleteFile(fileId);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    // 404 = already gone — that's fine
    if (!msg.includes("404") && !msg.includes("Not Found")) {
      throw err;
    }
  }
}

/**
 * List files in an ImageKit folder.
 * Returns an array of { fileId, url, name, size }.
 */
export async function listFromImageKit(
  folder: string
): Promise<ImageKitUploadResult[]> {
  const ik = getClient();

  const files = await ik.listFiles({
    path: folder,
    limit: 100,
    skip: 0,
    sort: "DESC_CREATED",
  });

  return (Array.isArray(files) ? files : []).map((f) => ({
    fileId: f.fileId,
    url: f.url,
    name: f.name,
    size: f.size,
    width: (f as { width?: number }).width ?? undefined,
    height: (f as { height?: number }).height ?? undefined,
  }));
}

/**
 * Build the ImageKit folder path for a project + optional named folder.
 * Examples:
 *   projectFolder("proj123")                → "/nova/proj123"
 *   projectFolder("proj123", "hero-images") → "/nova/proj123/hero-images"
 */
export function projectFolder(projectId: string, folderName?: string): string {
  const base = `/nova/${projectId}`;
  return folderName ? `${base}/${folderName}` : base;
}

/**
 * Returns true if ImageKit env vars are configured.
 * Used to decide between ImageKit and R2 upload paths.
 */
export function isImageKitConfigured(): boolean {
  return !!(
    process.env.IMAGEKIT_PUBLIC_KEY &&
    process.env.IMAGEKIT_PRIVATE_KEY &&
    process.env.IMAGEKIT_URL_ENDPOINT
  );
}
