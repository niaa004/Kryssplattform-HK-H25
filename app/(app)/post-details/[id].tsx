import * as commentApi from "@/api/commentApi";
import * as postApi from "@/api/postApi";
import { useAuthSession } from "@/providers/authctx";
import { PostComment, PostData } from "@/types/post";
import { getPostByLocalId } from "@/utils/local-storage";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
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
  const { userNameSession, user } = useAuthSession();

  const [post, setPost] = useState<PostData | null>(null);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<PostComment[]>([]);

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
    if (post) {
      await fetchCommentsFromApi(post.comments);
    }
  }

  async function fetchCommentsFromApi(ids: string[]) {
    const comments = await commentApi.getCommentsByIds(ids);
    setComments(comments);
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
          <FlatList
            data={comments}
            renderItem={(comment) => (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View style={styles.commentItem}>
                  <Text style={[styles.smallTextStyle, { color: "gray" }]}>
                    {comment.item.author}:
                  </Text>
                  <Text style={styles.smallTextStyle}>
                    {comment.item.comment}
                  </Text>
                </View>
                <Pressable
                  onPress={() => {
                    if (comment.item.authorId !== user?.uid) return;
                    commentApi.deleteComment(comment.item.id, post.id);
                    setComments(
                      comments.filter((c) => c.id !== comment.item.id)
                    );
                  }}
                >
                  <MaterialIcons name="delete-outline" size={20} color="red" />
                </Pressable>
              </View>
            )}
          />
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
                authorId: user?.uid ?? "Dette skal ikke skje",
                comment: commentText,
                author: userNameSession ?? "Dette skal ikke skje",
              };

              commentApi.createComment(newComment, post.id);
              setComments([...comments, newComment]);
              setCommentText("");
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
