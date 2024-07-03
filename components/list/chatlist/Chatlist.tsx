"use client";

import React, { useEffect, useState } from "react";
import AddUser from "./addUser/Adduser";
import { useUserStore } from "@/lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useChatStore } from "@/lib/chatStore";
import Image, { ImageLoaderProps } from "next/image";

interface User {
  username: string;
  blocked: string;
  avatar: string;
}

interface ChatItem {
  chatId: string;
  receiverId: string;
  updatedAt: number;
  isSeen: boolean;
  user: User;
  lastMessage: string;
}

interface FirestoreChatItem {
  chatId: string;
  receiverId: string;
  updatedAt: number;
  isSeen: boolean;
  lastMessage: string;
}

const Chatlist: React.FC = () => {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [input, setInput] = useState("");
  const [addMode, setAddMode] = useState(false);

  const myLoader = ({ src, width, quality }: ImageLoaderProps) => {
    if (src.startsWith("http") || src.startsWith("https")) {
      return `${src}&w=${width}&q=${quality || 75}`;
    }
    return `/${src}?w=${width}&q=${quality || 75}`;
  };

  const { chatId, changeChat } = useChatStore();

  const currentUser = useUserStore((state) => state.currentUser);

  useEffect(() => {
    if (!currentUser || !currentUser.id) {
      console.error("Current user is not defined");
      return;
    }

    const userChatsRef = doc(db, "userchats", currentUser.id);

    const unSub = onSnapshot(
      userChatsRef,
      async (res) => {
        const data = res.data();
        if (!data) {
          console.error("No chat data found");
          return;
        }

        const items: FirestoreChatItem[] = data.chats || [];

        const promises = items.map(async (item: FirestoreChatItem) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDoc = await getDoc(userDocRef);

          const user = userDoc.data() as User;

          return { ...item, user };
        });

        const chatData = await Promise.all(promises);

        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      },
      (error) => {
        console.error("Error fetching chats: ", error);
      }
    );

    return () => {
      unSub();
    };
  }, [currentUser?.id]);

  const handleSelect = async (chat: ChatItem) => {
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );

    userChats[chatIndex].isSeen = true;

    const userChatsRef = doc(db, "userchats", currentUser.id);

    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });
      changeChat(chat.chatId, chat.user);
    } catch (err) {
      console.log(err);
    }
  };

  const filteredChats = chats.filter((c) =>
    c.user.username.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className="overflow-scroll">
      <div className="flex items-center gap-5 p-5">
        <div className="flex w-full bg-custom-rgba items-center gap-5 rounded-[10px] p-3">
          <input
            type="text"
            placeholder="Search"
            onChange={(e) => setInput(e.target.value)}
            className="bg-transparent w-full border-none outline-none text-white"
          />
        </div>
        <Image
          src={addMode ? "./minus.png" : "./plus.png"}
          alt={addMode ? "./minus.png" : "./plus.png"}
          width={32}
          height={32}
          loader={myLoader}
          className="w-9 h-9 bg-custom-rgba p-2 mr-2 rounded-[10px] cursor-pointer"
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>
      {filteredChats.map((chat) => (
        <div
          key={chat.chatId}
          className="flex items-center gap-5 p-5 cursor-pointer border-b-[1px] border-b-[#dddddd35] hover:bg-slate-900/20 transition-all"
          onClick={() => handleSelect(chat)}
          style={{
            backgroundColor: chat?.isSeen ? "transparent" : "#5183fe",
          }}
        >
          <Image
            src={
              chat.user.blocked.includes(currentUser.id)
                ? "./avatar.png"
                : chat.user.avatar || "./avatar.png"
            }
            width={32}
            height={32}
            loader={myLoader}
            alt="avatar"
            className="w-12 h-12 rounded-[50%] object-cover"
          />
          <div className="flex flex-col gap-3">
            <span className="font-[500]">
              {chat.user.blocked.includes(currentUser.id)
                ? "User"
                : chat.user.username}
            </span>
            <p className="text-[14px] font-[300]">{chat.lastMessage}</p>
          </div>
        </div>
      ))}

      {addMode && <AddUser />}
    </div>
  );
};

export default Chatlist;
