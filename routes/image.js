const express = require('express')
const router = express.Router();
const { createPost, getAllImages, deleteImage } = require('../controllers/image');
const {upload }  = require('../utils/uploader');
const  {authMiddleware}  = require('../middleware/auth');

router.post('/', upload.single('image'), authMiddleware, createPost);
router.get('/',  getAllImages);
router.delete('/:id', authMiddleware, deleteImage);

module.exports = router