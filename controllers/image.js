const Image = require("../schema/image");
const cloudinary = require("../utils/cloudinary");
exports.createPost = async (req, res) => {
  try {
    const { title, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        message: "No image file provided",
        success: false,
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "User authentication required",
        success: false,
      });
    }

    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({
        message: "User authentication required",
        success: false,
      });
    }

    // Upload to Cloudinary with proper error handling
    let responseURL;
    try {
      responseURL = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "posts" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(file.buffer);
      });
    } catch (cloudinaryError) {
      console.error("Cloudinary upload failed:", cloudinaryError);
      return res.status(500).json({
        message: "Image upload failed",
        success: false,
      });
    }

    // Create the image record with correct property mapping
    const image = await Image.create({
      title,
      description,
      image: responseURL.secure_url,
      userId,
    });

    return res.status(201).json({
      message: "Image created successfully",
      success: true,
      data: image,
    });
  } catch (error) {
    console.error("Create post error:", error);
    return res.status(500).json({
      message: "Failed to create post",
      error: error.message,
      success: false,
    });
  }
};

exports.getImage = async (req, res) => {
  try {
    const { id } = req.params;

    // Find image by ID
    const image = await Image.findByPk(id);

    if (!image) {
      return res.status(404).json({
        message: "Image not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Image retrieved successfully",
      success: true,
      data: image,
    });
  } catch (error) {
    console.error("Get image error:", error);
    return res.status(500).json({
      message: "Failed to retrieve image",
      error: error.message,
      success: false,
    });
  }
};

exports.getAllImages = async (req, res) => {
  try {
    const images = await Image.findAll();

    if (images.length === 0) {
      return res.status(404).json({
        message: "No images found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Images retrieved successfully",
      success: true,
      data: images,
    });
  } catch (error) {
    console.error("Get all images error:", error);
    return res.status(500).json({
      message: "Failed to retrieve images",
      error: error.message,
      success: false,
    });
  }
};

// Delete an image by ID
exports.deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const image = await Image.findByPk(id);

    if (!image) {
      return res.status(404).json({
        message: "Image not found",
        success: false,
      });
    }

    //  Prevent unauthorized deletion
    if (image.userId !== userId) {
      return res.status(403).json({
        message: "You are not authorized to delete this image",
        success: false,
      });
    }

    const publicId = image.image.split("/").pop().split(".")[0];

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(`posts/${publicId}`);
    } catch (cloudinaryError) {
      console.error("Cloudinary delete failed:", cloudinaryError);
      return res.status(500).json({
        message: "Failed to delete image from Cloudinary",
        success: false,
      });
    }

    // Delete from database
    await image.destroy();

    return res.status(200).json({
      message: "Image deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Delete image error:", error);
    return res.status(500).json({
      message: "Failed to delete image",
      error: error.message,
      success: false,
    });
  }
};

