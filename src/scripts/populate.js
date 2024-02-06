const mongoose = require("mongoose");
const User = require("../models/user");
const Product = require("../models/product");
const Menu = require("../models/menu");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/burger_db", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create users
const usersData = [
  { username: "user1", password: "password1" },
  { username: "user2", password: "password2" },
  { username: "admin", password: "adminpassword", isAdmin: true },
];

User.insertMany(usersData)
  .then((users) => {
    console.log("Users added:", users);

    // Create products
    const productsData = [];
    const productTypes = [
      "Burger",
      "Drink",
      "Potato",
      "Salad",
      "Sauce",
      "IceCream",
    ];
    productTypes.forEach((type) => {
      for (let i = 1; i <= 3; i++) {
        productsData.push({
          title: `${type} ${i}`,
          description: `Description for ${type} ${i}`,
          price: Math.floor(Math.random() * 7) + 1,
          type: type,
        });
      }
    });

    Product.insertMany(productsData)
      .then((products) => {
        console.log("Products added:", products);

        // Create menus
        const menusData = [];
        const menuProducts = {};
        productTypes.forEach((type) => {
          menuProducts[type] = products
            .filter((product) => product.type === type)
            .map((product) => product._id);
        });

        for (let i = 1; i <= 5; i++) {
          const menuProductsIds = productTypes.map(
            (type) => menuProducts[type][Math.floor(Math.random() * 3)]
          );

          const menuPrice =
            menuProductsIds.reduce((acc, productId) => {
              const product = products.find((p) => p._id.equals(productId));
              return acc + product.price;
            }, 0) * 0.7; // Apply 30% discount

          const menu = {
            title: `Menu ${i}`,
            description: `Description for Menu ${i}`,
            price: menuPrice.toFixed(2),
            size: "medium",
            products: menuProductsIds,
          };

          menusData.push(menu);
        }

        Menu.insertMany(menusData)
          .then((menus) => {
            console.log("Menus added:", menus);
            mongoose.connection.close();
          })
          .catch((err) => console.error("Error creating menus:", err));
      })
      .catch((err) => console.error("Error creating products:", err));
  })
  .catch((err) => console.error("Error creating users:", err));
