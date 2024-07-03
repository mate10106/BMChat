import { FormEvent, useState } from "react";
import { toast } from "react-toastify";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import upload from "../lib/upload";
import Image, { ImageLoaderProps } from "next/image";

const Login = () => {
  const myLoader = ({ src, width, quality }: ImageLoaderProps): string => {
    return `/${src}?w=${width}&q=${quality || 75}`;
  };

  const [avatar, setAvatar] = useState({
    file: null as File | null,
    url: "",
  });

  const [loading, setLoading] = useState(false);

  const handleAvatar = (e: FormEvent<HTMLInputElement>) => {
    if (e.currentTarget.files && e.currentTarget.files[0]) {
      setAvatar({
        file: e.currentTarget.files[0],
        url: URL.createObjectURL(e.currentTarget.files[0]),
      });
    }
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      const imgUrl = await upload(avatar.file);

      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        avatar: imgUrl,
        id: res.user.uid,
        blocked: [],
      });

      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: [],
      });

      toast.success("Account created! You can login now!");
    } catch (err) {
      console.log(err);
      toast.error("An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.log(err);
      toast.error("An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-12 flex w-full h-full items-center gap-[100px] max-lg:flex-col max-lg:gap-0 max-lg:h-[90%]">
      <div className="flex-1 flex flex-col items-center gap-[20px]">
        <h2>Welcome back,</h2>
        <form
          onSubmit={handleLogin}
          className="flex flex-col items-center justify-center gap-[20px]"
        >
          <input
            type="text"
            placeholder="Email"
            name="email"
            className="p-[20px] border-none outline-none bg-[rgba(17,25,40,0.6)] text-white rounded-[5px]"
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            className="p-[20px] border-none outline-none bg-[rgba(17,25,40,0.6)] text-white rounded-[5px]"
          />
          <button
            disabled={loading}
            className={`w-full p-[20px] border-none rounded-[5px] cursor-pointer font-medium ${
              loading
                ? "bg-[#1f8ff19c] cursor-not-allowed"
                : "bg-[#1f8ef1] text-white"
            }`}
          >
            {loading ? "Loading" : "Sign In"}
          </button>
        </form>
      </div>
      <div className="h-[80%] w-[2px] bg-[#dddddd35] max-lg:rotate-90"></div>
      <div className="flex-1 flex flex-col items-center gap-[20px]">
        <h2>Create an Account</h2>
        <form
          onSubmit={handleRegister}
          className="flex flex-col items-center justify-center gap-[20px]"
        >
          <label
            htmlFor="file"
            className="w-full flex items-center justify-between cursor-pointer underline"
          >
            <Image
              src={avatar?.url || "./avatar.png"}
              width={22}
              height={22}
              loader={myLoader}
              alt="avatar"
              className="w-[50px] h-[50px] rounded-[10px] object-cover opacity-[0.6]"
            />
            Upload an image
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleAvatar}
          />
          <input
            type="text"
            placeholder="Username"
            name="username"
            className="p-[20px] border-none outline-none bg-[rgba(17,25,40,0.6)] text-white rounded-[5px]"
          />
          <input
            type="text"
            placeholder="Email"
            name="email"
            className="p-[20px] border-none outline-none bg-[rgba(17,25,40,0.6)] text-white rounded-[5px]"
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            className="p-[20px] border-none outline-none bg-[rgba(17,25,40,0.6)] text-white rounded-[5px]"
          />
          <button
            disabled={loading}
            className={`w-full p-[20px] border-none rounded-[5px] cursor-pointer font-medium ${
              loading
                ? "bg-[#1f8ff19c] cursor-not-allowed"
                : "bg-[#1f8ef1] text-white"
            }`}
          >
            {loading ? "Loading" : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
