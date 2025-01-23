
import express, {Express, Request, Response} from "express";

const app: Express = express();

app.get('/', (req: Request, res: Response) => {
    res.send("Hello, World!");
});

// port should change later, from env file
app.listen(80, () => {
    console.log(`[${Util.ProgramName}] API Server Started.`);
});