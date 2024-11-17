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
  origin: ["http://localhost:5173", "https://final-project-frontend-xxyh.vercel.app"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));
app.use(cookieParser());
app.use("/api", apiRouter);

app.get('/', (req, res, next) => {
  res.json({ message: "Hello world!" });
});

// Setting server timeout for all requests
const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// Setting a 50-second timeout for the server
server.setTimeout(50000); // Timeout in milliseconds (50,000 ms = 50 seconds)
