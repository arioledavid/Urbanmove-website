import { v2 as cloudinary } from "cloudinary";

let configured = false;

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET must be set.",
    );
  }

  if (!configured) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    configured = true;
  }

  return cloudinary;
}

export async function uploadImageBuffer(
  buffer: Buffer,
  filename?: string,
): Promise<{ url: string; publicId: string }> {
  const client = configureCloudinary();

  return new Promise((resolve, reject) => {
    const stream = client.uploader.upload_stream(
      {
        folder: "urbanmove/jobs",
        resource_type: "image",
        filename_override: filename,
        use_filename: Boolean(filename),
        unique_filename: true,
        overwrite: false,
        transformation: [
          {
            width: 1600,
            crop: "limit",
            quality: "auto",
            fetch_format: "jpg",
          },
        ],
      },
      (error, result) => {
        if (error || !result?.secure_url || !result.public_id) {
          reject(error ?? new Error("Cloudinary upload failed."));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );

    stream.end(buffer);
  });
}
