import sharp from "sharp";

export const SITE_IMAGE_MAX_EDGE = 2880;

export function fittedSize(
  width: number,
  height: number,
  maxEdge = SITE_IMAGE_MAX_EDGE,
) {
  const longEdge = Math.max(width, height);
  if (longEdge <= maxEdge) {
    return { width, height, resized: false as const };
  }
  const scale = maxEdge / longEdge;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
    resized: true as const,
  };
}

export async function limitImageEdge(input: Buffer, contentType: string) {
  const metadata = await sharp(input, { failOn: "none" }).metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error("Could not read the image size.");
  }
  const fitted = fittedSize(metadata.width, metadata.height);
  if (!fitted.resized) {
    return { bytes: input, contentType };
  }

  const pipeline = sharp(input, { failOn: "none" }).resize(
    fitted.width,
    fitted.height,
    { fit: "inside", withoutEnlargement: true },
  );
  if (contentType === "image/png") {
    return { bytes: await pipeline.png().toBuffer(), contentType };
  }
  if (contentType === "image/webp") {
    return {
      bytes: await pipeline.webp({ quality: 82 }).toBuffer(),
      contentType,
    };
  }
  return {
    bytes: await pipeline.jpeg({ quality: 82 }).toBuffer(),
    contentType: "image/jpeg",
  };
}
