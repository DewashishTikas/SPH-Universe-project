import multer from "multer";
import mongoFileStorage from "./storageEngine.js";
import File from "../models/file.js";



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `./uploads/${file.fieldname.replaceAll(" ", "_").toLowerCase()}`);
    },
    filename: (req, file, cb) => {
        const name = Date.now() + file.originalname;
        console.log(name);
        cb(null, name);
    }
});

const fileStorage = mongoFileStorage({
    mongoModel: (req, file, cb) => {
        cb(null, File);
    },
});

const upload = multer({ storage: fileStorage, limits: { fileSize: 1048576 } });
export default upload;