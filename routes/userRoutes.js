import express from "express";
import { authUser } from "../middleware/authUser.js";
import { create, login, updateProfile, userLogout, userProfile } from "../controllers/userControllers.js";
const router=express.Router()

router.post("/signup",create)

router.post("/login",login)

router.get("/profile",authUser,userProfile)

router.put("/profile",authUser,updateProfile)
  
router.post("/logout",authUser,userLogout)

export {router as userRouter}