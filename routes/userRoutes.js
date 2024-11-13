import express from "express";
import { authUser } from "../middleware/authUser.js";
import { checkUser,login, signup, updateProfile, userLogout, userProfile } from "../controllers/userControllers.js";
const router=express.Router()

router.post("/signup",signup)

router.post("/login",login)

router.get("/profile",authUser,userProfile)

router.put("/profile",authUser,updateProfile)
  
router.post("/logout",authUser,userLogout)

router.get("/check-user",authUser,checkUser)

export {router as userRouter}