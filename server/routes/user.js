import express from "express";
import VacancyModel from "../models/vacancy.js";
import ContactModel from "../models/contact.js";
import { uploadFiles } from "../middlewares/uploadFile.js";
import ApplyModel from "../models/applications.js";
import ProfileModel from "../models/profile.js"

const router = express.Router();

router.get('/', (req, res) => {
    return res.send("Hello from User");
});

router.get('/vacancy', async (req, res) => {
    try {
        let vacancies = await VacancyModel.find({}).select("name");
        vacancies = vacancies.map((vacancy) => {
            return { id: vacancy.id, name: vacancy.name };
        });
        return res.status(200).json({ data: vacancies });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to load all vacancies!!" });
    }
});

router.post('/contact', async (req, res) => {
    try {
        const data = req.body;
        const newContact = new ContactModel(data);
        await newContact.save();
        return res.status(200).json({ message: "We will contact you soon !!" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to save your contact details. Please try again" })
    }
});

router.post('/applications', uploadFiles(["Signature", "Photo", "Resume", "Attach Original Marksheet"]), async (req, res) => {
    try {
        const formData = req.body;
        const files = req.files;
        const data = {
            name: formData["Name"],
            fatherName: formData["Father's Name"],
            motherName: formData["Mother's Name"],
            DOB: formData["Date of Birth"],
            mobileNum: formData["Mobile Number"],
            mobileNumAlt: formData["Mobile Number (Alternative)"],
            emailId: formData["Email"],
            qualification: formData["Qualification"],
            category: formData["Category"],
            mpDomicile: formData["MP Domicile"],
            address: formData["Address"],
            referenceName: formData["Reference Name"],
            question: formData["Any Question"],
            post: formData["Selected Vacancy"],
            signatureId: files["Signature"][0].id,
            photoId: files["Photo"][0].id,
            resumeId: files["Resume"][0].id,
            marksheetId: files["Attach Original Marksheet"][0].id,
        }
        const newApplication = new ApplyModel(data);
        await newApplication.save();
        return res.status(200).json({ message: "Your application is saved successfully!!" });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to save your application. Please try again later!!" });
    }
});

router.post("/profile", uploadFiles("Resume"), async (req, res) => {
    try {
        const formData = req.body;
        const file = req.file;
        const data = {
            userName: formData["Full Name"],
            email: formData["Email"],
            linkedInUrl: formData["LinkedIn URL"],
            resumeId: file.id,
            phoneNo: formData["phoneNo"]
        }
        const newProfile = new ProfileModel(data);
        await newProfile.save();
        return res.status(200).json({message: "Your profile is saved successfully!!"});
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({error: "Failed to save profile info. Please try again!!"});
    }
});

export default router;