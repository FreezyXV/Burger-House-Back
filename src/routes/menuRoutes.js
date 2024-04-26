const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menuController"); 
const auth = require("../middlewares/auth");

router.get("/", menuController.getAllMenus);
router.get("/:id", menuController.getMenuById);
router.post("/add", auth, menuController.createMenu);
router.put("/modify/:id", auth, menuController.editMenu);
router.delete("/delete/:id", auth, menuController.deleteMenu);

module.exports = router;

