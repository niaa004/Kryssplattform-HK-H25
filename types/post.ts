import { LocationObjectCoords } from "expo-location";

export interface PostData {
  id: string;
  authorId: string; // Glemte at jeg ikke fikk lagt denne til forrige forelesning, så jeg hadde ikke denne med i oppgaven, men den trengs
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
