import { db } from "../../../../lib/firebase";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { FormEvent, useState } from "react";
import { useUserStore } from "../../../../lib/userStore";
import Image, { ImageLoaderProps } from "next/image";

interface User {
  id: string;
  username: string;
  avatar?: string;
}

const AddUser = () => {
  const myLoader = ({ src, width, quality }: ImageLoaderProps) => {
    if (src.startsWith("http") || src.startsWith("https")) {
      return `${src}&w=${width}&q=${quality || 75}`;
    }
    return `/${src}?w=${width}&q=${quality || 75}`;
  };

  const [user, setUser] = useState<User | null>(null);
  const { currentUser } = useUserStore();

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const username = formData.get("username");

    try {
      const userRef = collection(db, "users");

      const que = query(userRef, where("username", "==", username));

      const querySnapShot = await getDocs(que);

      if (!querySnapShot.empty) {
        const userData = querySnapShot.docs[0].data() as User;

        setUser({
          id: querySnapShot.docs[0].id,
          username: userData.username,
          avatar: userData.avatar,
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleAdd = async () => {
    if (!user) return;

    const chatRef = collection(db, "chats");
    const userChatsRef = collection(db, "userchats");

    try {
      const newChatRef = doc(chatRef);

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      await updateDoc(doc(userChatsRef, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      });

      await updateDoc(doc(userChatsRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updatedAt: Date.now(),
        }),
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="w-max h-max p-[30px] bg-[rgba(17,25,40,0.781)] rounded-[10px] absolute top-0 bottom-0 left-0 right-0 m-auto">
      <form onSubmit={handleSearch} className="flex gap-[20px]">
        <input
          type="text"
          placeholder="Username"
          name="username"
          className="p-[20px] rounded-[10px] border-none outline-none text-black font-bold"
        />
        <button className="p-[20px] rounded-[10px] bg-[#1a73e8] text-white border-none cursor-pointer">
          Search
        </button>
      </form>
      {user && (
        <div className="mt-[50px] flex items-center justify-between">
          <div className="flex items-center gap-[20px]">
            <Image
              src={user.avatar || "./avatar.png"}
              width={22}
              height={22}
              loader={myLoader}
              alt="avatar"
              className="w-[50px] h-[50px] rounded-full object-cover"
            />
            <span>{user.username}</span>
          </div>
          <button
            onClick={handleAdd}
            className="p-[10px] rounded-[10px] bg-[#1a73e8] text-white border-none cursor-pointer"
          >
            Add User
          </button>
        </div>
      )}
    </div>
  );
};

export default AddUser;
