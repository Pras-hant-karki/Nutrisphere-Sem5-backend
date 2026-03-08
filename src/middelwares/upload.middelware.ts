import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { HttpError } from "../errors/http-error";

// Determine upload directory based on field name
const getUploadDir = (fieldName: string) => {
    if (fieldName === 'profilePicture') {
        const profileDir = path.join(__dirname, '../../public/profile_pictures');
        if (!fs.existsSync(profileDir)) {
            fs.mkdirSync(profileDir, { recursive: true });
        }
        return profileDir;
    }

    if (fieldName === 'fitnessVideo') {
        const fitnessVideoDir = path.join(__dirname, '../../public/fitness_videos');
        if (!fs.existsSync(fitnessVideoDir)) {
            fs.mkdirSync(fitnessVideoDir, { recursive: true });
        }
        return fitnessVideoDir;
    }
    
    // Default to fitness_photos for all other uploads
    const fitnessDir = path.join(__dirname, '../../public/fitness_photos');
    if (!fs.existsSync(fitnessDir)) {
        fs.mkdirSync(fitnessDir, { recursive: true });
    }
    return fitnessDir;
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = getUploadDir(file.fieldname);
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = uuidv4();
        const extension = path.extname(file.originalname);
        cb(null, uniqueSuffix + extension);
    }
});

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Allow common image and video mime types for fitness uploads
    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo',
        'video/x-ms-wmv'
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF and common video formats are allowed.'));
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    // Allow practical video sizes from phone cameras while keeping a hard cap.
    limits: { fileSize: 50 * 1024 * 1024 }
});

export const uploads = {
    single: (fieldName: string) => upload.single(fieldName),
    array: (fieldName: string, maxCount: number) => upload.array(fieldName, maxCount),
    fields: (fieldsArray: { name: string; maxCount?: number }[]) => upload.fields(fieldsArray)
};