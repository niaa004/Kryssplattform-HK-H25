import { db, getDownloadUrl } from "@/firebaseConfig";
import { PostData } from "@/types/post";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { uploadImageToFirebase } from "./imageApi";

export async function createPost(post: PostData) {
  try {
    const firebaseImage = await uploadImageToFirebase(post.imageUri);
    if (!firebaseImage) {
      console.error("Error while uplaoding image");
      return;
    }

    const postImageDownloadUrl = await getDownloadUrl(firebaseImage);
    const postWithImage: PostData = {
      ...post,
      imageUri: postImageDownloadUrl,
    };
    const docRef = await addDoc(collection(db, "posts"), postWithImage);
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.log("Error creating post", e);
  }
}

export async function getAllPosts() {
  try {
    const queryResult = await getDocs(collection(db, "posts"));
    const posts = queryResult.docs.map(
      (doc) =>
        ({
          ...doc.data(),
          id: doc.id,
        } as PostData)
    );
    console.log("Successfully fetched posts: ", posts);
    return posts;
  } catch (e) {
    console.log("Error getting all posts", e);
    return [] as PostData[];
  }
}

export async function getPostById(id: string) {
  try {
    const specificPost = await getDoc(doc(db, "posts", id));
    return {
      ...specificPost.data(),
      id: specificPost.id,
    } as PostData;
  } catch (e) {
    console.log("Error getting document by id: ", e);
    return null;
  }
}

// Ny funksjon som filtrerer innlegg etter author Id, dette går vi gjennom i neste forelesning
export async function getPostsForUser(userId: string) {
  try {
    const querySnapshot = await getDocs(
      query(collection(db, "posts"), where("authorId", "==", userId))
    );
    return querySnapshot.docs.map((doc) => {
      console.log(doc.data());
      return { ...doc.data(), id: doc.id } as PostData;
    });
  } catch (e) {
    console.log("Error getting all posts for user", e);
    return [] as PostData[];
  }
}
