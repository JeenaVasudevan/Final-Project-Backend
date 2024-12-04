import express from "express";
import {
  addOrUpdateAddress,
  fetchUserAddress
} from "../controllers/addressControllers.js"; 
import { authUser } from "../middleware/authUser.js"; 
import { isUser } from "../middleware/isUser.js"; 

const router = express.Router();

router.post("/address", authUser, isUser, addOrUpdateAddress);

router.get("/address", authUser, isUser, fetchUserAddress);

export { router as addressRouter };