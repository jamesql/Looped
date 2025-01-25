import express, { Router, Request, Response } from "express";

const router: Router = express.Router();

// Test response
router.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

// todo:

router.post("/create-server", (req: Request, res: Response) => {});

router.post("/join-server", (req: Request, res: Response) => {});

router.post("/leave-server", (req: Request, res: Response) => {});

router.post("/modify-server", (req: Request, res: Response) => {});

router.post("/delete-server", (req: Request, res: Response) => {});

router.post("/create-channel", (req: Request, res: Response) => {});

router.post("/modify-channel", (req: Request, res: Response) => {});

router.post("/delete-channel", (req: Request, res: Response) => {});

router.post("/message", (req: Request, res: Response) => {});

router.post("/modify-message", (req: Request, res: Response) => {});

router.post("/delete-message", (req: Request, res: Response) => {});

module.exports = router;
