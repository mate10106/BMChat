import { useUserStore } from "@/lib/userStore";
import Image, { ImageLoaderProps } from "next/image";
import React from "react";

const Userinfo = () => {
  const { currentUser } = useUserStore();

  const myLoader = ({ src, width, quality }: ImageLoaderProps) => {
    if (src.startsWith("http") || src.startsWith("https")) {
      return `${src}&w=${width}&q=${quality || 75}`;
    }
    return `/${src}?w=${width}&q=${quality || 75}`;
  };

  return (
    <div className="p-5 flex items-center justify-between">
      <div className="flex items-center gap-5">
        <Image
          src={currentUser.avatar || "./avatar.png"}
          width={32}
          height={32}
          loader={myLoader}
          alt="avatar"
          className="w-12 h-12 rounded-[50%] object-cover"
        />
        <h2>{currentUser.username}</h2>
      </div>
      <Image
        src="./edit.png"
        width={32}
        height={32}
        loader={myLoader}
        alt="edit"
        className="w-5 h-5 cursor-pointer"
      />
    </div>
  );
};

export default Userinfo;
