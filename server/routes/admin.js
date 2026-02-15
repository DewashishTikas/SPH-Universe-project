import express from "express";
import jwt from "jsonwebtoken";
import VacancyModel from "../models/vacancy.js";
import ProfileModel from "../models/profile.js";
import FileModel from "../models/file.js";
import { megaStorage, deleteFileById } from "../services/megaStorageEngine.js";
import ApplicationsModel from "../models/applications.js";

const router = express.Router({ mergeParams: true });

router.get('/', (req, res) => {
    res.status(200);
});

router.post('/login', (req, res) => {
    try {
        const { adminUserName, adminPass } = req.body;
        if ((adminUserName == process.env.ADMIN_USERNAME) && (adminPass == process.env.ADMIN_PASSWORD)) {
            const payload = { username: adminUserName, password: adminPass, role: "ADMIN" };
            const sessionToken = jwt.sign(payload, process.env.JWT_PRIVATE_KEY);
            res.setHeader("Set-Cookie", `sessionToken=${sessionToken};HttpOnly;Domain=${process.env.SERVER_DOMAIN};SameSite=None;Secure;expires=` + Date.toString(Date.now() + 60 * 60 * 60 * 24));
            return res.status(200).json({ message: 'ok' });
        }
        return res.status(400).json({ error: "invalid cridentials !!" });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "try agian later !!" });
    }
});

router.get("/signout", (req, res) => {
    try {
        res.setHeader("Set-Cookie", `sessionToken=${""};HttpOnly;Domain=${process.env.SERVER_DOMAIN};SameSite=None;Secure;expires=` + Date.toString(Date.now() + 60 * 60 * 60 * 24));
        res.status(200).json({ message: "Logout successfully!!" });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "try agian later !!" });
    }
});

router.post('/vacancy', async (req, res) => {
    try {
        const { post } = req.body;
        const newVacany = new VacancyModel({ name: post });
        await newVacany.save();
        return res.status(200).json({ message: "Vacancy is added successfully!!" });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to save vacancy, please try it again later!!" });
    }
});

router.delete('/vacancy', async (req, res) => {
    try {
        const { vacancyId } = req.body;
        if (vacancyId) {
            await VacancyModel.deleteOne({ _id: vacancyId });
            console.log(`Vacancy with id:${vacancyId} is deleted successfully`);
            return res.status(200).json({ message: "Post is deleted successfully!!" });
        }
        else {
            return res.status(400).json({ error: "Post ID is missing!!" });
        }
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to delete the post. Please try again later!!" });
    }
});

router.get("/profile", async (req, res) => {
    try {
        const allProfiles = await ProfileModel.find({});
        res.status(200).json({ data: allProfiles });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to send user profile!!" });
    }
});

router.delete("/profile", async (req, res) => {
    try {
        const { id } = req.body;
        const { resumeId } = await ProfileModel.findById(id);
        const isFileDeleted = await deleteFileById(resumeId);
        if(!isFileDeleted){
            console.log(`Failed to delete resume file of Profile with id:${id}`);
            return res.status(500).json({error: "Failed to delete File!!"});
        }
        await ProfileModel.findByIdAndDelete(id);
        console.log(`Profile with id:${id} is deleted successfully`);
        res.status(200).json({ message: "Delete user profile successfully!!" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete user profile!!" });
    }
});

router.get("/applications", async (req, res) => {
    try {
        const allApp = await ApplicationsModel.find({});
        res.status(200).json({ data: allApp });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to send user applications!!" });
    }
});

router.delete("/applications", async (req, res) => {
    try {
        const { id } = req.body;
        const { photoId, resumeId, marksheetId, signatureId } = await ApplicationsModel.findById(id);
        const isAllFileDeleted = await [photoId, resumeId, marksheetId, signatureId]
            .map((id) => async (preStatus) => {
                const isDeleted = await deleteFileById(id);
                return isDeleted && preStatus;
            })
            .reduce(async (acc, fn)=>{
                return acc.then(fn);
        }, Promise.resolve(true));
        if(!isAllFileDeleted){
            console.log(`Failed to delete some files of Application with id:${id}!!`);
            return res.status(500).json({error: "Failed to delete some files!!"});
        } 
        await ApplicationsModel.findByIdAndDelete(id);
        console.log(`Application with id:${id} is deleted successfully!!`);
        res.status(200).json({ message: "Applications is deleted successfully!!" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete user applications!!" });
    }
});

router.get("/file/:id", async (req, res) => {
    try {
        const fileId = req.params.id;
        const { nodeId } = await FileModel.findById(fileId, "nodeId");
        const targetFile = megaStorage.navigate("uploads").find(file => file.nodeId == nodeId);
        if(!targetFile) return res.status(400).json({error: "File not found!!"});
        const readStream = targetFile.download();
        readStream.on("error", async (err) => {
            console.error(err);
            // await readStream.close();
            return res.status(500).json({ error: "Failed to server requested file!!" });
        });
        readStream.pipe(res);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to server requested file!!" });
    }
});
export default router;