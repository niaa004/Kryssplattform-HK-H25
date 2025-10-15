import { getStorageRef } from "@/firebaseConfig";
import { uploadBytesResumable } from "firebase/storage";


export async function uploadImageToFirebase(uri: string) {
    const fetchResponse = await fetch(uri);
    const blob = await fetchResponse.blob();
// "file:///Users/brage/Library/Developer/CoreSimulator/Devices/C8BC4198-4154-4C60-800B-55176A0E445C/data/Containers/Data/Application/3E20BFA1-44CB-4064-B7B6-7244B03B6A2A/Library/Caches/ExponentExperienceData/@anonymous/Kryssplattform-HK-H25-5cbd25da-4413-4337-92e1-acfd47b8751b/ImagePicker/8C21A6E7-7D3B-4760-BE14-A344C37A719A.jpg"
    const imageName = uri.split("/").pop()?.split(".")[0] ?? "AnonymtBilde";
    const uploadPath = `images/${imageName}`;
    const imageRef = await getStorageRef(uploadPath);

    try {
        console.log("Starting upload");
        await uploadBytesResumable(imageRef, blob);
        console.log("Image uploaded to firebase");
        return uploadPath;
    } catch (e) {
        console.error("Error uploading image to firebase", e);
        return null;
    }
}