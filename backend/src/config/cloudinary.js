import { v2 as cloudinary } from 'cloudinary';

<<<<<<< HEAD
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
=======
const {
  CLOUDINARY_API_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;

if (!CLOUDINARY_API_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.warn('Cloudinary environment variables are not fully configured. Image uploads will fail.');
}

cloudinary.config({
  cloud_name: CLOUDINARY_API_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
>>>>>>> d5315fe90fb6ea3097500102a0612a63f54d0e98
});

export default cloudinary;
