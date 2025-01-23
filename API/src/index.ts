
import express, {Express, Request, Response} from "express";
import bodyParser from "body-parser";

const app: Express = express();

const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(bodyParser.json());

app.get('/', (req: Request, res: Response) => {
    res.send("Hello, World!");
});

app.use("/api", require("./routers/API"));
app.use("/auth", require("./routers/Auth"));


// port should change later, from env file
app.listen(80, () => {
    console.log(`[$api] API Server Started.`);
});