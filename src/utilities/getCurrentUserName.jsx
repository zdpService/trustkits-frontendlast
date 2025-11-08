import { auth, db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";

export const getCurrentUserName = async () => {
  if (!auth.currentUser) return "Nom Utilisateur";

  const userDocRef = doc(db, "users", auth.currentUser.uid);
  const userSnap = await getDoc(userDocRef);

  if (userSnap.exists()) {
    const userData = userSnap.data();
    return userData.name || auth.currentUser.displayName || "Nom Utilisateur";
  } else {
    return auth.currentUser.displayName || "Nom Utilisateur";
  }
};
