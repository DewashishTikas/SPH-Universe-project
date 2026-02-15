export const logger = () => {
    return (req, res, next) => {
        console.log(`{path: ${req.path}, method: ${req.method}}`);
        next();
    }
}