// src/utils/cloudinaryUploader.ts (Create this file)

/**
 * Uploads an image file to Cloudinary using an unsigned preset.
 *
 * @param imageUri The local URI of the image file (e.g., from Expo ImagePicker).
 * @returns The secure URL of the uploaded image, or null if the upload fails.
 */
export async function uploadImageToCloudinary(imageUri: string): Promise<string | null> {
    const cloudinaryUrl = process.env.EXPO_PUBLIC_CLOUDINARY_URL;
    const uploadPreset = process.env.EXPO_PUBLIC_UPLOAD_PRESET; // Use the environment variable for the upload preset
    if (!cloudinaryUrl) {
        console.error("EXPO_PUBLIC_CLOUDINARY_URL environment variable is not set.");
        // Consider throwing an error or returning a specific error message
        return null;
    }
    if (!uploadPreset) {
        console.error("Cloudinary upload preset is not configured in cloudinaryUploader.ts");
        // Consider throwing an error or returning a specific error message
        return null;
    }


    const formData = new FormData();

    // Extract filename and type from URI
    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename || '');
    // Default to jpeg if type inference fails, Cloudinary often handles it
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    // Append the file - React Native's FormData automatically handles the file object structure
    formData.append('file', { uri: imageUri, name: filename, type } as any);
    formData.append('upload_preset', uploadPreset);
    // You can add other parameters like tags, context, etc., if needed
    // formData.append('tags', 'user_avatar');

    console.log("Uploading to Cloudinary:", cloudinaryUrl); // For debugging

    try {
        const response = await fetch(cloudinaryUrl, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
                // 'Content-Type': 'multipart/form-data', // This header is often set automatically by fetch for FormData
            },
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("Cloudinary upload API error:", result.error?.message || `HTTP status ${response.status}`);
            // Provide a more user-friendly error message potentially
            throw new Error(result.error?.message || `Cloudinary upload failed.`);
        }

        if (result.secure_url) {
            console.log('Cloudinary Upload Success:', result.secure_url);
            return result.secure_url; // Return the secure URL
        } else {
            console.error("Cloudinary upload failed: 'secure_url' not found in response.", result);
            throw new Error("Upload completed, but couldn't get the image URL.");
        }
    } catch (error: any) {
        console.error("Error during Cloudinary upload fetch:", error);
        // Return null or re-throw a custom error object
        return null;
    }
}