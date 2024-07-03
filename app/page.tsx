// pages/index.tsx or pages/home.tsx
"use client";

import { useEffect } from "react";
import Chat from "@/components/Chat";
import Section from "@/components/Section";
import List from "@/components/list/List";
import Login from "@/components/Login";
import Notification from "@/components/Notification";
import { onAuthStateChanged } from "firebase/auth";
import { useUserStore } from "@/lib/userStore";
import { auth } from "@/lib/firebase";
import { useChatStore } from "@/lib/chatStore";

export default function Home() {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId, setChatId } = useChatStore();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });

    return () => unSub();
  }, [fetchUserInfo]);

  if (isLoading)
    return (
      <div className="p-16 text-4xl rounded-[10px] bg-custom-rgba">
        Loading...
      </div>
    );

  return (
    <Section>
      {currentUser ? (
        <div className="lg:block w-full">{chatId ? <Chat /> : <List />}</div>
      ) : (
        <Login />
      )}
      <Notification />
    </Section>
  );
}
