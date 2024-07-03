import { useUserStore } from "../lib/userStore";
import { auth, db } from "../lib/firebase";
import { useChatStore } from "@/lib/chatStore";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import Image, { ImageLoaderProps } from "next/image";

interface DetailProps {
  handleClose: () => void;
}

const Detail: React.FC<DetailProps> = ({ handleClose }) => {
  const myLoader = ({ src, width, quality }: ImageLoaderProps) => {
    if (src.startsWith("http") || src.startsWith("https")) {
      return `${src}&w=${width}&q=${quality || 75}`;
    }
    return `/${src}?w=${width}&q=${quality || 75}`;
  };

  const {
    chatId,
    user,
    isCurrentUserBlocked,
    isReceiverBlocked,
    changeBlock,
    resetChat,
  } = useChatStore();
  const { currentUser } = useUserStore();

  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    resetChat();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="w-96 border border-[#dddddd35] rounded-3xl backdrop-blur-md">
        <div className="p-[30px_20px] flex flex-col items-center gap-[15px] border-b border-[#dddddd35]">
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white"
          >
            X
          </button>
          <Image
            src={currentUser.avatar}
            alt="avatar"
            width={22}
            height={22}
            loader={myLoader}
            className="w-[100px] h-[100px] rounded-full object-cover"
          />
          <h2>{currentUser.username}</h2>
          <p className="text-center">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Atque
            impedit sint veritatis.
          </p>
        </div>
        <div className="p-[20px] flex flex-col gap-[25px]">
          <div className="option">
            <div className="flex items-center justify-between">
              <span>Chat Settings</span>
              <Image
                src="./arrowUp.png"
                width={22}
                height={22}
                loader={myLoader}
                alt="arrowUp"
                className="w-[30px] h-[30px] bg-[rgba(17,25,40,0.3)] p-[10px] rounded-full cursor-pointer"
              />
            </div>
          </div>
          <div className="option">
            <div className="flex items-center justify-between">
              <span>Privacy & help</span>
              <Image
                src="./arrowUp.png"
                width={22}
                height={22}
                loader={myLoader}
                alt="arrowUp"
                className="w-[30px] h-[30px] bg-[rgba(17,25,40,0.3)] p-[10px] rounded-full cursor-pointer"
              />
            </div>
            <div className="flex flex-col gap-[20px] mt-[20px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-[20px]">
                  <Image
                    src="https://images.unsplash.com/photo-1719230693490-786d994f72b2?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    width={22}
                    height={22}
                    loader={myLoader}
                    alt="picture"
                    className="w-[40px] h-[40px] rounded-[5px] object-cover"
                  />
                  <span className="text-[14px] text-lightgray font-light">
                    photo_2024_2.png
                  </span>
                </div>
                <Image
                  src="./download.png"
                  width={22}
                  height={22}
                  loader={myLoader}
                  alt="download"
                  className="w-[30px] h-[30px] bg-[rgba(17,25,40,0.3)] p-[10px] rounded-full cursor-pointer"
                />
              </div>
            </div>
          </div>
          <div className="option">
            <div className="flex items-center justify-between">
              <span>Share Files</span>
              <Image
                src="./arrowDown.png"
                alt="arrowDown"
                width={22}
                height={22}
                loader={myLoader}
                className="w-[30px] h-[30px] bg-[rgba(17,25,40,0.3)] p-[10px] rounded-full cursor-pointer"
              />
            </div>
          </div>
          <button
            onClick={handleBlock}
            className="p-[15px] bg-[rgba(230,74,105,0.553)] text-white border-none rounded-[5px] cursor-pointer hover:bg-[rgba(220,20,60,0.796)]"
          >
            {isCurrentUserBlocked
              ? "You are Blocked!"
              : isReceiverBlocked
              ? "User blocked!"
              : "Block User"}
          </button>
          <button
            className="p-[10px] bg-[#1a73e8] text-white border-none rounded-[5px] cursor-pointer"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Detail;
