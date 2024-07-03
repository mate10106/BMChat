/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: "out",
  images: {
    loader: "custom",
    path: "/",
  },
};

export default nextConfig;
