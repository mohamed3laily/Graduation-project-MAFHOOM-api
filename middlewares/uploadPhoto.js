const multer = require("multer");
const sharp = require("sharp");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const { promisify } = require("util");

// Promisify fs.unlink to use it asynchronously
const unlinkAsync = promisify(fs.unlink);
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Please upload a photo"), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single("photo");

exports.uploadPhotoCloud = async (req, res, next) => {
  if (!req.file) return next();

  try {
    // Resize the image and create a temporary file
    const resizedImageBuffer = await sharp(req.file.buffer)
      .resize(500, 500, { fit: "inside" }) // Ensure aspect ratio is preserved
      .toFormat("jpeg")
      .jpeg({ quality: 90 })
      .toBuffer();

    const tempFilePath = `temp_${Date.now()}.jpeg`;
    fs.writeFileSync(tempFilePath, resizedImageBuffer);

    // Upload the temporary file to Cloudinary
    const result = await cloudinary.uploader.upload(tempFilePath, {
      folder: "avatars", // Specify the folder in Cloudinary to upload the image
    });

    // Clean up the temporary file
    await unlinkAsync(tempFilePath);

    // Set the Cloudinary URL and handle potential errors
    req.file.cloudinaryUrl = result.secure_url;
    next();
  } catch (error) {
    console.error("Error resizing or uploading user photo:", error);
    next(error); // Re-throw for proper error handling
  }
};
