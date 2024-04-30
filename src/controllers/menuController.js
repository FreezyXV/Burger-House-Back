const Menu = require("../models/menu");

//Créer un Menu
exports.createMenu = async (req, res) => {
  try {
    const newMenu = new Menu(req.body);
    const savedMenu = await newMenu.save();
    res.status(201).json(savedMenu);
  } catch (error) {
    const statusCode = error.name === "ValidationError" ? 400 : 500;
    res.status(statusCode).json({ message: error.message });
  }
};

// Afficher tous les Menus
exports.getAllMenus = async (req, res) => {
  try {
    console.log('ici')
    const menus = await Menu.find({});
    res.status(200).json(menus);
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while fetching menus." });
  }
};

//Afficher un Menu par son ID
exports.getMenuById = async (req, res) => {
  try {
    const menu = await Menu.findById(req.params.id);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }
    res.status(200).json(menu);
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while fetching the menu." });
  }
};

//Mettre à jour un Menu
exports.editMenu = async (req, res) => {
  try {
    const updatedMenu = await Menu.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedMenu) {
      return res.status(404).json({ message: "Menu not found" });
    }
    res.status(200).json(updatedMenu);
  } catch (error) {
    const statusCode = error.name === "ValidationError" ? 400 : 500;
    res.status(statusCode).json({ message: error.message });
  }
};

//Supprimer un Menu
exports.deleteMenu = async (req, res) => {
  try {
    const menu = await Menu.findByIdAndDelete(req.params.id);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found" });
    }
    res.status(200).json({ message: "Menu deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "An error occurred during deletion." });
  }
};
