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
        // Get username from request parameters
        const username = req.params.username;
        if (!username) {
            return cb(new Error('Username is required for file upload'), null);
        }

        // Create unique filename with username and timestamp
        const timestamp = Date.now();
        const cleanUsername = username.replace(/[^a-zA-Z0-9]/g, ''); // Remove special characters
        const uniqueSuffix = `${cleanUsername}-${timestamp}`;
        
        // Add a random string to ensure uniqueness
        const randomString = Math.random().toString(36).substring(2, 8);
        
        cb(null, `${uniqueSuffix}-${randomString}${path.extname(file.originalname).toLowerCase()}`);
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