import * as commentApi from "@/api/commentApi";
import * as postApi from "@/api/postApi";
import { useAuthSession } from "@/providers/authctx";
import { PostComment, PostData } from "@/types/post";
import { getPostByLocalId } from "@/utils/local-storage";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MapView, { Callout, Marker } from "react-native-maps";

export default function PostDetailsPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userNameSession } = useAuthSession();

  const [post, setPost] = useState<PostData | null>(null);
  const [commentText, setCommentText] = useState("");

  async function fetchPostFromLocal(inputId: string) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const postLocal = await getPostByLocalId(inputId);
    if (postLocal) {
      setPost(postLocal);
    }
  }

  async function fetchPostFromApi(inputId: string) {
    const post = await postApi.getPostById(inputId);
    setPost(post);
  }

  // Dette er kun en testefunksjon for å se at ting fungerer, den vil bli fjernet senere
  async function deleteCommentTEST(id: string) {
    await commentApi.deleteComment(id);
    fetchCommentsFromApiTEST();
  }

  // Dette er kun en testefunksjon for å se at ting fungerer, den vil bli fjernet senere
  async function fetchCommentsFromApiTEST() {
    const ids = [
      "23v4qh8523XeVFAdrJpX",
      "BDCZEnRvWayiYwnxBksP",
      "rvgOEAMZQqyTquwWMuok",
    ];
    const comments = await commentApi.getCommentsByIds(ids);
    console.log(comments);
  }

  useEffect(() => {
    // fetchPostFromLocal(id);
    fetchPostFromApi(id);
  }, [id]);

  if (post === null) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Henter innlegg</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <Image style={styles.imageStyle} source={{ uri: post.imageUri }} />
      <View style={styles.contentContainer}>
        <Text style={styles.titleStyle}>{post.title}</Text>
        <Text style={[styles.textStyle, { paddingTop: 6 }]}>
          {post.description}
        </Text>
      </View>
      <View style={styles.commentsContainer}>
        <Text style={styles.commentTitle}>Kommentarer</Text>
        <View style={styles.commentsList}>
          {/* <FlatList
            data={post.comments}
            renderItem={(comment) => (
              <View style={styles.commentItem}>
                <Text style={[styles.smallTextStyle, { color: "gray" }]}>
                  {comment.item.author}:
                </Text>
                <Text style={styles.smallTextStyle}>
                  {comment.item.comment}
                </Text>
              </View>
            )}
          /> */}
        </View>
        <View style={styles.addCommentContainer}>
          <TextInput
            // {/* value={commentText} */}
            onChangeText={setCommentText}
            style={styles.commentTextField}
            placeholder="Skriv en kommentar"
          />
          <Pressable
            onPress={() => {
              const newComment: PostComment = {
                id: commentText,
                authorId: userNameSession ?? "Dette skal ikke skje",
                comment: commentText,
                author: userNameSession ?? "Dette skal ikke skje",
              };

              const postComments = post.comments;
              // postComments.push(newComment);
              // Dette kalles "object spread operator" og er en metode for å kopiere et object samtidig som man endrer en eller flere av verdiene
              const updatedPost: PostData = {
                ...post,
                comments: postComments,
              };

              commentApi.createComment(newComment);
              setPost(updatedPost);
              setCommentText("");

              // fetchCommentsFromApiTEST();
              // deleteCommentTEST("BDCZEnRvWayiYwnxBksP");
            }}
          >
            <Text style={styles.smallTextStyle}>Legg til</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.mapContainer}>
        <MapView
          zoomEnabled={false}
          scrollEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
          initialRegion={{
            latitude: post.postCoordinates?.latitude ?? 0,
            longitude: post.postCoordinates?.longitude ?? 0,
            latitudeDelta: 0.0082,
            longitudeDelta: 0.0081,
          }}
          style={{ width: "100%", height: "100%" }}
        >
          <Marker
            coordinate={{
              latitude: post.postCoordinates?.latitude ?? 0,
              longitude: post.postCoordinates?.longitude ?? 0,
            }}
          >
            <Callout>
              <Text>Hei jeg er en callout</Text>
            </Callout>
          </Marker>
        </MapView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageStyle: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  titleStyle: {
    fontSize: 28,
    fontWeight: "bold",
  },
  textStyle: {
    fontSize: 18,
  },
  smallTextStyle: {
    fontSize: 16,
  },
  postDataContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
  },
  commentsContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  commentItem: {
    flexDirection: "row",
    gap: 6,
    paddingVertical: 2,
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  commentsList: {
    maxHeight: 140,
    marginTop: 2,
  },
  addCommentContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  commentTextField: {
    borderBottomWidth: 1,
    borderColor: "gray",
    width: "70%",
    fontSize: 16,
  },
  mapContainer: {
    paddingHorizontal: 16,
    width: "100%",
    height: 250,
    marginTop: 16,
  },
});
