import express, {Router, Request, Response} from "express";

const router: Router = express.Router();

// Test response
router.get("/", (req: Request, res: Response) => {
    res.send("Hello, World!");
});

module.exports = router;