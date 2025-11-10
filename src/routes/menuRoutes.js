const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menuController"); 
const auth = require("../middlewares/auth");
const requireAdmin = require("../middlewares/requireAdmin");

router.get("/", menuController.getAllMenus);
router.get("/:id", menuController.getMenuById);
router.post("/add", auth, requireAdmin, menuController.createMenu);
router.put("/modify/:id", auth, requireAdmin, menuController.editMenu);
router.delete("/delete/:id", auth, requireAdmin, menuController.deleteMenu);

module.exports = router;
