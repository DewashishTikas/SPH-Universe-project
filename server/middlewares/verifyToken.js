import jwt from "jsonwebtoken";

export const verifyAdminToken = (req, res, next) => {
    try {
        if(req.path == "/login") return next();

        const { sessionToken } = req.cookies;
        if(sessionToken) {
            const { username, password } = jwt.verify(sessionToken, process.env.JWT_PRIVATE_KEY);
            if((username == process.env.ADMIN_USERNAME) && (password == process.env.ADMIN_PASSWORD)){
                return next();
            }
        }
        return res.status(400).json({message: "Unauthorized Request !!"});
    }
    catch (err) {
        console.error(err);
        res.status(500).json({error: "Some thing went wrong. Please try agian later !!"});
    }
}