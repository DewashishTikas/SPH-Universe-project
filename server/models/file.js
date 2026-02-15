import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

export const fileSchema = new Schema({
    url: { type: String, require: true },
    size: { type: Number, require: true },
    mimetype: { type: String, require: true },
    encoding: { type: String, require: true },
    fieldname: { type: String, require: true },
    filename: { type: String, require: true },
    nodeId: { type: String, require: true }
},
    { timestamps: true });

export default models['File'] || model('File', fileSchema);