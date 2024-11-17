import express from 'express';
import { connectDB } from './config/db.js';
import { apiRouter } from './routes/index.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();
const port = 3000;

connectDB();
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:5173", "https://final-project-frontend-j3if.vercel.app"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));
app.use(cookieParser());
app.use("/api", apiRouter);

app.get('/', (req, res, next) => {
  res.json({ message: "Hello world!" });
});

const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
server.setTimeout(50000); 
