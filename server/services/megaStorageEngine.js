import { Storage, File as megaFile } from "megajs";
import FileModel from "../models/file.js"

export const megaStorage = await new Storage({
    email: process.env.MEGA_EMAIL,
    password: process.env.MEGA_PASSWORD,
}).ready;

megaStorage.on("ready", () => {
    console.log("Login successfully in Mega Cloud!!");
});

megaStorage.on("error", (err) => {
    console.error("Failed to login in Mega Cloud!!");
});

function MegaFileStorageEngine(opts) {
    this.getDestination = opts.filePath;
    this.getFilename = opts.filename;
}

MegaFileStorageEngine.prototype._handleFile = function _handleFile(req, multerFile, cb) {
    this.getFilename(req, multerFile, function (err, name) {
        if (err) return cb(err);
        try {
            multerFile.filename = name;
        } catch (err) {
            console.error(err);
        }
    });
    this.getDestination(req, multerFile, function (err, path) {
        if (err) return cb(err);
        try {
            const uploadStream = megaStorage.navigate(path).upload({
                name: multerFile.filename,
                allowUploadBuffering: true,
                forceHttps: true,
            });

            multerFile.stream.pipe(uploadStream);
            uploadStream.on('error', cb);
            uploadStream.on('complete', async function (uploadedFile) {
                const fileUrl = await uploadedFile.link();
                const fileSize = uploadedFile.size;
                const fileDoc = await FileModel.create({
                    ...multerFile,
                    url: fileUrl,
                    size: fileSize,
                    nodeId: uploadedFile.nodeId,
                });
                cb(null, {
                    url: fileUrl,
                    size: fileSize,
                    id: fileDoc.id,
                });
            });
        }
        catch (err) {
            console.error(err);
            cb(err);
        }
    });
}

MegaFileStorageEngine.prototype._removeFile = function _removeFile(req, file, cb) {
    const getFileDoc = (fileId)=>{
        return FileModel.findById(fileId, "nodeId");
    }
    getFileDoc(file.id)
        .then((fileDoc)=>{
            const { nodeId } = fileDoc;
            const targetFile = megaStorage.find(file => file.nodeId == nodeId);
            return targetFile.delete();
        })
        .then(()=>{
            return FileModel.findByIdAndDelete(file.id);
        })
        .then(() => {
            console.log(`file with id:${file.id} and fieldname:${file.fieldname} is deleted by multer.`);
            cb();
        })
        .catch((err) => {
            console.error(err);
            cb(err);
        });
}

function megaFileStorage(opts) {
    return new MegaFileStorageEngine(opts);
}

export default megaFileStorage;


export const deleteFileById = async (fileId) => {
    try {
        const { nodeId, fieldname } = await FileModel.findById(fileId, "nodeId fieldname");
        const targetFile = megaStorage.navigate("uploads").find(file => file.nodeId == nodeId);
        await targetFile.delete();
        await FileModel.findByIdAndDelete(fileId);
        console.log(`File with id:${fileId} fieldname:${fieldname} is deleted successfully!!`);
        return true;
    }
    catch (err) {
        console.log(`Failed to deleted file with id:${fileId}!!`);
        console.error(err);
        return false;
    }
}
