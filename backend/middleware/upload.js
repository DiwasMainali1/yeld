// middleware/upload.js
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/'));
    },
    filename: function(req, file, cb) {
        // Create unique filename with user ID and timestamp
        const uniqueSuffix = `${req.user._id}-${Date.now()}`;
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// File filter function
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    // Check the mime type
    const mimeTypeValid = allowedTypes.test(file.mimetype);
    // Check the file extension
    const extNameValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimeTypeValid && extNameValid) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed!'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
});

export default upload;