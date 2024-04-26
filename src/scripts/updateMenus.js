const mongoose = require("mongoose");
const menuSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number },
  imageSrc: { type: String, required: true },
  size: {
    type: String,
    enum: ["medium", "large"],
    default: "medium",
  },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
});

const Menu = mongoose.model("Menu", menuSchema);


const mongoDB = "mongodb://localhost:27017/burgerDB";
mongoose
  .connect(mongoDB)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const defaultImageSrc = "imagePath";

async function updateMenus() {
  try {
    const result = await Menu.updateMany(
      {},
      { $set: { imageSrc: defaultImageSrc } }
    );
    console.log("Update result:", result);
  } catch (error) {
    console.error("Error updating menus:", error);
  } finally {
    mongoose.disconnect();
  }
}

updateMenus();
