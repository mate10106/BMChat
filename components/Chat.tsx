"use client";
import { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useChatStore } from "../lib/chatStore";
import { useUserStore } from "../lib/userStore";
import upload from "../lib/upload";
import { format } from "timeago.js";
import Detail from "./Detail";
import Image, { ImageLoaderProps } from "next/image";

interface Message {
  senderId: string;
  text: string;
  createdAt: { toDate: () => Date } | null;
  img?: string;
}

interface ChatState {
  messages: Message[];
}

interface ImgState {
  file: File | null;
  url: string;
}

interface UserChat {
  chatId: string;
  lastMessage: string;
  isSeen: boolean;
  updatedAt: number;
}

const Chat = () => {
  const [chat, setChat] = useState<ChatState>({ messages: [] });
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [img, setImg] = useState<ImgState>({
    file: null,
    url: "",
  });
  const [showIcons, setShowIcons] = useState(false);
  const { setChatId } = useChatStore();

  const handleIconClick = () => {
    setShowDetails((prevShowDetail) => !prevShowDetail);
  };

  const myLoader = ({ src, width, quality }: ImageLoaderProps) => {
    if (src.startsWith("http") || src.startsWith("https")) {
      return `${src}&w=${width}&q=${quality || 75}`;
    }
    return `/${src}?w=${width}&q=${quality || 75}`;
  };

  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();

  const endRef = useRef(null);

  useEffect(() => {
    if (endRef.current) {
      (endRef.current as HTMLDivElement).scrollIntoView({ behavior: "smooth" });
    }
  }, [chat.messages]);

  useEffect(() => {
    if (chatId) {
      const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
        const data = res.data();
        if (data) {
          setChat(data as ChatState);
        } else {
          setChat({ messages: [] });
        }
      });

      return () => {
        unSub();
      };
    }
  }, [chatId]);

  const handleEmoji = (e: { emoji: string }) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSend = async () => {
    if (!text) return;

    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }

      if (!chatId || !currentUser || !user) {
        console.error("chatId, currentUser, or user is not defined");
        return;
      }

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });

      const userIDs = [currentUser.id, user.id];

      for (const id of userIDs) {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();

          const chatIndex = userChatsData.chats.findIndex(
            (c: UserChat) => c.chatId === chatId
          );

          if (chatIndex > -1) {
            userChatsData.chats[chatIndex].lastMessage = text;
            userChatsData.chats[chatIndex].isSeen =
              id === currentUser.id ? true : false;
            userChatsData.chats[chatIndex].updatedAt = Date.now();

            await updateDoc(userChatsRef, {
              chats: userChatsData.chats,
            });
          } else {
            console.error("Chat not found in userChatsData");
          }
        } else {
          console.error("userChatsSnapshot does not exist");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setImg({
        file: null,
        url: "",
      });

      setText("");
    }
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
  };

  return (
    <div className="border-l border-r border-[#dddddd25] h-full flex flex-col">
      <div className="p-5 flex items-center justify-between border-b border-[#dddddd25]">
        <div className="flex items-center gap-5">
          <button onClick={() => setChatId(null)} className="back-button">
            <Image
              src="list-ul-alt-svgrepo-com.svg"
              alt="send"
              width={32}
              height={32}
              loader={myLoader}
            />
          </button>
          <Image
            src={user?.avatar || "./avatar.png"}
            width={32}
            height={32}
            loader={myLoader}
            alt="avatar"
            className="w-16 h-16 rounded-full object-cover"
          />
          <div className="flex flex-col gap-1">
            <span className="text-lg font-bold">{user?.username}</span>
            <p className="text-sm font-light text-gray-400 max-sm:hidden">
              Lorem ipsum dolor, sit amet.
            </p>
          </div>
        </div>
        <div className="flex gap-5">
          <Image
            src="./phone.png"
            width={32}
            height={32}
            loader={myLoader}
            alt="phone"
            className="icon"
          />
          <Image
            src="./video.png"
            width={32}
            height={32}
            loader={myLoader}
            alt="video"
            className="icon"
          />
          <div>
            <Image
              src="./info.png"
              width={32}
              height={32}
              loader={myLoader}
              alt="info"
              className="icon"
              onClick={handleIconClick}
            />
            {showDetails && chatId && (
              <Detail handleClose={handleCloseDetails} />
            )}
          </div>
        </div>
      </div>
      <div className="p-5 overflow-scroll flex flex-col gap-5 flex-1">
        {chat?.messages?.map((message) => (
          <div
            className={
              message.senderId === currentUser?.id ? "ownmessage" : "message"
            }
            key={message?.createdAt?.toDate().toString()}
          >
            <div className="flex flex-col gap-1">
              {message.img && (
                <Image
                  src={message.img}
                  width={32}
                  height={32}
                  loader={myLoader}
                  alt="image"
                />
              )}
              <p>{message.text}</p>
              <span className="text-xs">
                {message.createdAt && message.createdAt.toDate
                  ? format(message.createdAt.toDate())
                  : "just now"}
              </span>
            </div>
          </div>
        ))}
        {img.url && (
          <div className="flex self-end max-w-[70%]">
            <div className="flex flex-col gap-1 flex-1">
              <Image
                src={img.url}
                width={32}
                height={32}
                loader={myLoader}
                alt="image"
                className="w-full h-[300px] rounded-2xl object-cover"
              />
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>
      <div className="p-5 flex items-center justify-between border-t border-[#dddddd25] gap-5 mt-auto">
        <div className="flex gap-5">
          <div className="relative">
            <button
              onClick={() => setShowIcons((prev) => !prev)}
              className="w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center sm:hidden"
            >
              +
            </button>
            {showIcons && (
              <div className="absolute bottom-16 w-max left-0 flex gap-4 p-2 bg-gray-800 rounded-lg">
                <label htmlFor="file">
                  <Image
                    src="./img.png"
                    width={32}
                    height={32}
                    loader={myLoader}
                    alt="image"
                    className="w-5 h-5 cursor-pointer"
                  />
                </label>
                <input
                  type="file"
                  id="file"
                  className="hidden"
                  onChange={handleImg}
                />
                <Image
                  src="./camera.png"
                  width={32}
                  height={32}
                  loader={myLoader}
                  alt="camera"
                  className="w-5 h-5 cursor-pointer"
                />
                <Image
                  src="./mic.png"
                  width={32}
                  height={32}
                  loader={myLoader}
                  alt="mic"
                  className="w-5 h-5 cursor-pointer"
                />
                <div className="relative">
                  <Image
                    src="./emoji.png"
                    width={32}
                    height={32}
                    loader={myLoader}
                    alt="emoji"
                    onClick={() => setOpen((prev) => !prev)}
                    className="w-5 h-5 cursor-pointer"
                  />
                  <div className="absolute bottom-10 -left-24">
                    <EmojiPicker open={open} onEmojiClick={handleEmoji} />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="hidden sm:flex gap-5">
            <label htmlFor="file">
              <Image
                src="./img.png"
                alt="image"
                width={32}
                height={32}
                loader={myLoader}
                className="w-5 h-5 cursor-pointer"
              />
            </label>
            <input
              type="file"
              id="file"
              className="hidden"
              onChange={handleImg}
            />
            <Image
              src="./camera.png"
              width={32}
              height={32}
              loader={myLoader}
              alt="camera"
              className="w-5 h-5 cursor-pointer"
            />
            <Image
              src="./mic.png"
              width={32}
              height={32}
              loader={myLoader}
              alt="mic"
              className="w-5 h-5 cursor-pointer"
            />
            <div className="relative">
              <Image
                src="./emoji.png"
                width={32}
                height={32}
                loader={myLoader}
                alt="emoji"
                onClick={() => setOpen((prev) => !prev)}
                className="w-5 h-5 cursor-pointer"
              />
              <div className="absolute bottom-12 left-0">
                <EmojiPicker open={open} onEmojiClick={handleEmoji} />
              </div>
            </div>
          </div>
        </div>
        <input
          type="text"
          placeholder={
            isCurrentUserBlocked || isReceiverBlocked
              ? "You cannot send a message"
              : "Type a message..."
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
          className="flex-1 bg-gray-800 border-none outline-none text-white p-4 rounded-xl text-lg"
        />
        <button
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
          className="bg-blue-600 text-white p-2 px-5 rounded-lg cursor-pointer max-sm:px-2"
        >
          <Image
            src="send-alt-1-svgrepo-com.svg"
            alt="send"
            width={32}
            height={32}
            loader={myLoader}
          />
        </button>
      </div>
    </div>
  );
};

export default Chat;
