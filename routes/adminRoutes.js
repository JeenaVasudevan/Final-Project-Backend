import express from "express";
import { adminLogin, adminLogout, adminProfile, adminSignup, adminUpdate, deleteAdmin} from "../controllers/adminControllers.js";
import { authAdmin } from "../middleware/authAdmin.js";
const router=express.Router()

router.post('/register',adminSignup)

router.post('/login',adminLogin)

router.get('/profile',authAdmin,adminProfile)

router.post('/logout',authAdmin,adminLogout)

router.put('/profile',authAdmin,adminUpdate)

router.delete('/delete',authAdmin,deleteAdmin)

export {router as adminRouter}