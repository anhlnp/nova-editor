import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

export type NovaAsset = {
  id: string;
  name: string;
  type: "image" | "font" | "file";
  format: string;
  size: number;
  url: string;
  key: string;           // R2 key OR ImageKit fileId (stored for deletion)
  createdAt: string;
  // image dimensions
  width?: number;
  height?: number;
  // font metadata (populated when type === "font")
  fontFamily?: string;
  fontWeight?: number;
  fontStyle?: "normal" | "italic" | "oblique";
  // folder system (optional — assets without folderId appear at root)
  folderId?: string | null;
  // ImageKit-specific: kept so DELETE route can call deleteFromImageKit(imagekitFileId)
  imagekitFileId?: string;
};

function getR2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "R2 not configured — set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME"
    );
  }
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export function makeAssetKey(projectId: string, assetId: string, filename: string): string {
  return `assets/${projectId}/${assetId}/${filename}`;
}

export function assetPublicUrl(key: string): string {
  const base = process.env.NEXT_PUBLIC_ASSET_BASE_URL?.replace(/\/$/, "") ?? "";
  return `${base}/${key}`;
}

export async function uploadToR2(key: string, data: Buffer, contentType: string): Promise<void> {
  const client = getR2Client();
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: data,
      ContentType: contentType,
    })
  );
}

export async function deleteFromR2(key: string): Promise<void> {
  const client = getR2Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    })
  );
}
