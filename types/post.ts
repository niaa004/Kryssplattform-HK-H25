import { LocationObjectCoords } from "expo-location";

export interface PostData {
    id: string;
    title: string;
    description: string;
    imageUri: string;
    comments: string[];
    postCoordinates: LocationObjectCoords | null;
}

export interface PostComment {
    id: string;
    authorId: string;
    author: string;
    comment: string;
}