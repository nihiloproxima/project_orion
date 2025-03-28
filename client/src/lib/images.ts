import { getStorage, ref, getDownloadURL } from 'firebase/storage';

export const getPublicImageUrl = async (bucketName: string, filePath: string) => {
	const storage = getStorage();
	const fileRef = ref(storage, `${bucketName}/${filePath}`);
	const publicUrl = await getDownloadURL(fileRef);
	return publicUrl;
};
