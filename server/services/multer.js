import multer from "multer";
import megaFileStorage from "./megaStorageEngine.js";

const megaStorage = megaFileStorage({
    filePath: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: megaStorage, limits: { fileSize: 1048576 } });
export default upload;