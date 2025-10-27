// controllers/menuController.js
const Menu = require("../models/menu");

// Créer un Menu
exports.createMenu = async (req, res, next) => {
  try {
    const newMenu = new Menu(req.body);
    const savedMenu = await newMenu.save();
    res.status(201).json(savedMenu);
  } catch (error) {
    next(error);
  }
};

// Afficher tous les Menus
exports.getAllMenus = async (req, res, next) => {
  try {
    const menus = await Menu.find({});
    res.status(200).json(menus);
  } catch (error) {
    next(error);
  }
};

// Afficher un Menu par son ID
exports.getMenuById = async (req, res, next) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }
    res.status(200).json(menu);
  } catch (error) {
    next(error);
  }
};

// Mettre à jour un Menu
exports.editMenu = async (req, res, next) => {
  try {
    const updatedMenu = await Menu.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedMenu) {
      return res.status(404).json({ message: "Menu not found" });
    }
    res.status(200).json(updatedMenu);
  } catch (error) {
    next(error);
  }
};

// Supprimer un Menu
exports.deleteMenu = async (req, res, next) => {
  try {
    const menu = await Menu.findByIdAndDelete(req.params.id);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }
    res.status(200).json({ message: "Menu deleted successfully" });
  } catch (error) {
    next(error);
  }
};
