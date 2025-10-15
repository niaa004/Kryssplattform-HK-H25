import { auth } from "@/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";


export async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        console.log("User signed in ", userCredential);
    }).catch((error) => console.log("Oops, kunne ikke logge inn", error))
}

export async function signOut() {
    await auth.signOut();
}