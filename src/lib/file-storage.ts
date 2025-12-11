// Stub uploader: replace with real storage service when available.
export const uploadFile = async (file: File, _folder: string): Promise<string> => {
  if (!file) throw new Error('No file provided');
  return URL.createObjectURL(file);
};
