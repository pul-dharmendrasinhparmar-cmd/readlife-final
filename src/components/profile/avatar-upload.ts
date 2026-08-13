/** Compress an image file to a small data URL for localStorage avatars. */
export async function fileToAvatarDataUrl(
  file: File,
  maxSize = 320,
  quality = 0.82,
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }
  // Cap raw file before decode (~8MB)
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Image is too large. Try one under 8MB.");
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Could not process image.");
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  // Soft cap ~450KB encoded
  if (dataUrl.length > 600_000) {
    return canvas.toDataURL("image/jpeg", 0.65);
  }
  return dataUrl;
}
