import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: 'defvbtczt',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export default cloudinary;