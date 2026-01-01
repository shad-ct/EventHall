// Uploads a file to imgbb and returns the hosted image URL.
// Falls back to a local object URL when an API key is not provided (useful for dev).
export const uploadFile = async (file: File, _folder: string): Promise<string> => {
  if (!file) throw new Error('No file provided');

  const apiKey = (import.meta as any).env?.VITE_IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error('VITE_IMGBB_API_KEY is not set. Configure your imgbb API key in VITE_IMGBB_API_KEY');
  }

  const form = new FormData();
  // imgbb accepts a file in the `image` field when sent as multipart/form-data
  form.append('image', file);
  // Optionally send a name to help identify the image
  form.append('name', file.name);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Image upload failed: ${res.status} ${res.statusText} - ${text}`);
  }

  const data = await res.json();
  // imgbb responds with the uploaded image info under `data` — prefer `url` then `display_url`
  const url = data?.data?.url || data?.data?.display_url;
  if (!url) throw new Error('No image URL returned from imgbb');
  return url;
};
