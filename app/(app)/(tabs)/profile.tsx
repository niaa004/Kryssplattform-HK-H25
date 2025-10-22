import * as postApi from "@/api/postApi";
import * as userApi from "@/api/userApi";
import { useAuthSession } from "@/providers/authctx";
import { PostData } from "@/types/post";
import { UserData } from "@/types/user";
import { Link, router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function ProfilePage() {
  const { user, userNameSession, signOut } = useAuthSession();
  const [userProfile, setUserProfile] = useState<UserData | null>(null);
  const [userPosts, setUserPosts] = useState<PostData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bioText, setBioText] = useState("");
  const [isEditingBio, setIsEditingBio] = useState(false);

  async function getUserData(userId: string) {
    const userData = await userApi.getUserProfile(userId);
    return userData;
  }

  async function getUserPosts(userId: string) {
    const userPosts = await postApi.getPostsForUser(userId);
    setUserPosts(userPosts);
  }

  // Her er det litt kronglete logikk for å bestemme hva som skal gjøres ut ifra om bio skal opprettes eller redigeres
  async function loadData() {
    setIsLoading(true);
    if (!user) return Alert.alert("Du er ikke logget inn!");
    const userData = await getUserData(user.uid);
    setUserProfile(userData);
    setBioText(userData?.bio ?? "");
    await getUserPosts(user.uid);
    setIsLoading(false);
  }

  async function createorEditUserProfile() {
    if (bioText.length === 0) {
      Alert.alert("Du må skrive noe om deg selv");
      return;
    }

    if (userProfile === null) {
      const newUserPortfile: UserData = {
        name: userNameSession ?? "Her er det feil",
        email: user?.email ?? "Her er det feil",
        bio: bioText,
      };
      await userApi.createUserProfile(user?.uid ?? "ERROR", newUserPortfile);
      loadData();
      return;
    }

    if (!isEditingBio) { // Første trykk skal man starte redigering
      setIsEditingBio(true);
      return;
    }

    await userApi.editUserBio(user?.uid ?? "ERROR", bioText); // andre trykk skal man lagre endringen
    loadData();
    setIsEditingBio(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={style.mainContainer}>
        
        <Stack.Screen // Flyttet info og logg ut til toppen av skjermen
          options={{
            headerLeft: () => (
              <Link
                style={[style.link, { paddingLeft: 12 }]}
                href={"/declarations"}
              >
                Info
              </Link>
            ),
            headerRight: () => (
              <Pressable
                style={{ paddingRight: 12 }}
                onPress={() => {
                  signOut();
                }}
              >
                <Text>Logg ut</Text>
              </Pressable>
            ),
          }}
        />
        <View style={style.profileContainer}>
          {!isLoading && (
            <>
              <Text>
                {userProfile === null
                  ? "Du har ikke opprettet en profil for " + userNameSession
                  : userProfile.name}
              </Text>
              <TextInput // Viser tekstboksen uansett om man skal opprette, redigere eller ikke gjøre noe. Den er disabled hvis man ikke redigerer bio
                style={style.textInput}
                value={bioText}
                placeholder="Skriv noe om deg her"
                numberOfLines={2}
                editable={isEditingBio || userProfile === null}
                multiline={true}
                onChangeText={setBioText}
              />
              <Pressable
                style={style.button}
                onPress={async () => {
                  createorEditUserProfile(); 
                }}
              >
                <Text>
                  {userProfile === null
                    ? "Opprett profil"
                    : isEditingBio
                    ? "Oppdater"
                    : "Rediger profil"}
                </Text>
              </Pressable>
            </>
          )}
        </View>
        <View style={{ flex: 1 }}>
          {isLoading ? (
            <Text>Laster innhold...</Text>
          ) : userPosts.length !== 0 ? (
            <ScrollView>
              <View style={style.postsGridContainer}>
                {userPosts.map((post) => (
                  <Pressable
                    key={post.id}
                    style={style.post}
                    onPress={() =>
                      router.push({
                        pathname: "/post-details/[id]",
                        params: { id: post.id },
                      })
                    }
                  >
                    <Image
                      style={{ width: "100%", height: 200 }}
                      source={{ uri: post.imageUri }}
                    />
                    <Text>{post.title}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          ) : (
            <View style={style.noPostsContainer}>
              <Text>Du har ikke lagt inn noen innlegg enda</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const style = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  link: {
    textDecorationLine: "underline",
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    width: "50%",
    fontSize: 16,
    padding: 8,
    borderColor: "gray",
    height: 80,
  },
  button: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
  },
  profileContainer: {
    height: "30%",
    backgroundColor: "white",
    paddingTop: 20,
    alignItems: "center",
    gap: 8,
  },
  postsGridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 40,
    paddingVertical: 16,
    justifyContent: "space-between",
    rowGap: 16,
  },
  post: {
    width: "48%",
    height: 220,
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  noPostsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
