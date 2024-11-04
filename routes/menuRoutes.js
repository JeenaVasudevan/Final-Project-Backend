import express from "express";
import { createMenu,deleteMenu,fetchMenuDetails,findAllMenus, updateMenu} from "../controllers/menuItemControllers.js";
import { authAdmin } from "../middleware/authAdmin.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

router.get("/all-menus", findAllMenus);

router.get("/menuDetails/:id", fetchMenuDetails);

router.post("/create", authAdmin, isAdmin, createMenu);

router.put("/update/:id", authAdmin, isAdmin, updateMenu);

router.delete("/delete/:id", authAdmin, isAdmin, deleteMenu);

export { router as menuRouter };
