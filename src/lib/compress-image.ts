const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.8;
const JPEG_TYPE = "image/jpeg";

function jpegName(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "").trim() || "photo";
  return `${base}.jpg`;
}

/**
 * Resize to a 1600px long edge and encode as JPEG. Falls back to the original
 * file if the browser cannot decode it (e.g. some HEIC sources).
 */
export async function compressImage(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    try {
      const scale = Math.min(
        1,
        MAX_EDGE / Math.max(bitmap.width, bitmap.height),
      );
      const width = Math.max(1, Math.round(bitmap.width * scale));
      const height = Math.max(1, Math.round(bitmap.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) {
        return file;
      }

      context.drawImage(bitmap, 0, 0, width, height);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, JPEG_TYPE, JPEG_QUALITY);
      });

      if (!blob) {
        return file;
      }

      if (blob.size >= file.size && file.type === JPEG_TYPE) {
        return file;
      }

      return new File([blob], jpegName(file.name), {
        type: JPEG_TYPE,
        lastModified: Date.now(),
      });
    } finally {
      bitmap.close();
    }
  } catch {
    return file;
  }
}
