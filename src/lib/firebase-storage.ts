import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Upload file to Firebase Storage
 */
export const uploadFileToFirebase = async (file: File, folder: string): Promise<string> => {
  try {
    // Create a reference to the file location
    const fileRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
    
    // Upload the file
    const snapshot = await uploadBytes(fileRef, file);
    
    // Get the download URL
    const downloadUrl = await getDownloadURL(snapshot.ref);
    
    console.log(`File uploaded successfully: ${downloadUrl}`);
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};
