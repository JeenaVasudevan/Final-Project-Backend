import express from "express";
import { adminLogout, adminProfile,adminUpdate, checkAdmin, deleteAdmin, login, signup} from "../controllers/adminControllers.js";
import { authAdmin } from "../middleware/authAdmin.js";
const router=express.Router()

router.post('/signup',signup)

router.post('/login',login)

router.get('/profile',authAdmin,adminProfile)

router.post('/logout',authAdmin,adminLogout)

router.put('/profile',authAdmin,adminUpdate)

router.delete('/delete',authAdmin,deleteAdmin)

router.get("/check-admin",authAdmin,checkAdmin)

export {router as adminRouter}