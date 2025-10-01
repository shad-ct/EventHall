import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const uploadImageToImgBB = async (file: File): Promise<string> => {
  const apiKey = "c31b5340081dec80f2fdc7b4c878a037";
  const formData = new FormData();

  // Convert file to base64
  const base64 = await fileToBase64(file);
  formData.append("image", base64);

  const response = await fetch(
    `https://api.imgbb.com/1/upload?expiration=600&key=${apiKey}`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to upload image");
  }

  const data = await response.json();
  return data.data.url;
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result as string;
      // Remove the data:image/...;base64, prefix
      const base64Data = base64.split(",")[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
  });
};
