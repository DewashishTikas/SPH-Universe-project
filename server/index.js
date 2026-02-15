import express from "express";
import 'dotenv/config';
import cors from "cors";
import cookieParser from "cookie-parser";
import { verifyAdminToken } from "./middlewares/verifyToken.js";
import adminRouter from "./routes/admin.js";
import userRouter from "./routes/user.js";
import { logger } from "./middlewares/logger.js";
import { connectMongoServer } from "./database/config.js";


const app = express();
const port = process.env.PORT || 8000;

await connectMongoServer(process.env.MONGODB_URL);


const corsOptions = {
    origin: (origin, callback) => {
        const originReg = /^http:\/\/192\.168\.[[:alnum:]]+\.[[:alnum:]]+:5173$/g;
        if (originReg.test(origin)) {
            return callback(null, true);
        }
        else {
            return callback(null, new Error("Not allowed by cors"))
        }
    },
    credentials: true,
}

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(logger());
app.use('/user', userRouter);
app.use('/admin', verifyAdminToken, adminRouter);

app.get('/', (req, res) => {
    res.send("server is live!!");
});

app.listen(port, () => {
    console.log(`server is listening on port ${port}!!`);
});