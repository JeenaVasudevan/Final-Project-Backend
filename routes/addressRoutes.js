import express from "express";
import {
  addOrUpdateAddress,
  fetchUserAddress
} from "../controllers/addressControllers.js"; 
import { authUser } from "../middleware/authUser.js"; 

const router = express.Router();

router.post("/address", authUser,addOrUpdateAddress);

router.get("/address", authUser,fetchUserAddress);

export { router as addressRouter };