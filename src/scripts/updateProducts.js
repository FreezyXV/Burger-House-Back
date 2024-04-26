const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number },
  MenuPrice: { type: Number }, 
  inStock: { type: Boolean, default: false },
  imageSrc: { type: String, required: true },
  type: {
    type: String,
    enum: ["Burger", "Drink", "Accompagnement", "Sauce", "IceCream"],
  },
});

const Product = mongoose.model("Product", productSchema);


const mongoDB = "mongodb://localhost:27017/burgerDB";
mongoose
  .connect(mongoDB)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

async function updateProductMenuPrice() {
  try {
    const result = await Product.updateMany(
      {}, 
      { $set: { MenuPrice: 0 } } 
    );
    console.log("Update result:", result);
  } catch (error) {
    console.error("Error updating products:", error);
  } finally {

    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
}

updateProductMenuPrice();
