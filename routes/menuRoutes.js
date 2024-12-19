import express from "express";
import { createMenu,deleteMenu,fetchMenuDetails,findAllMenus, updateMenu} from "../controllers/menuItemControllers.js";
import { authAdmin } from "../middleware/authAdmin.js";


const router = express.Router();

router.get("/all-menus", findAllMenus);

router.get("/menuDetails/:menuId", fetchMenuDetails);

router.post("/create", authAdmin,createMenu);

router.put("/update/:menuId", authAdmin,updateMenu);

router.delete("/delete/:menuId", authAdmin,deleteMenu);

export { router as menuRouter };
