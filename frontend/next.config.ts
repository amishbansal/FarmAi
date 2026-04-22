import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  images:{
    remotePatterns:[
      {
        hostname:"res.cloudinary.com",
        protocol:"https", 
      }
    ]
  },

  // basePath: '/farmai',
  // assetPrefix: '/farmai/',
  trailingSlash:true ,
  // output:"export"
};

export default nextConfig;
