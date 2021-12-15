const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Product = require("../models/product.model");
const { isAuthenticated, isAdmin } = require("../middleware/jwt.middleware");
const fileUploader = require("../config/cloudinary.config");

// * Create Product - Tested successfully
router.post("/api/products", isAuthenticated, fileUploader.single("imageURL"), async (req, res, next) => {
  try {
    // Get data from request body
    const { name, description, productImageURL, price } = req.body;
    const currentUser = req.payload;

    // Save data in DB
    const createdProduct = await Product.create({ name, description, productImageURL, price, creator: currentUser._id });

    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(404).json(error);
  }
});

// * Get all Products - Tested successfully
router.get("/api/products", async (req, res, next) => {
  try {
    const allProducts = await Product.find();

    res.status(200).json(allProducts);
  } catch (error) {
    res.status(500).json(error);
  }
});

// * Get a specific Product - when you click on any Product Card - Tested successfully
router.get("/api/products/:productId", async (req, res, next) => {
  try {
    // Get Product id from the URL
    const { productId } = req.params;

    // Validate the passed id
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({ message: "Invalid object ID" });
      return;
    }

    // Make DB query to find the Product
    const foundProduct = await Product.findById(productId);

    res.status(200).json(foundProduct);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Edit a Product (admin only)
router.put("/api/products/:productId", isAuthenticated, fileUploader.single("imageURL"), isAdmin, async (req, res, next) => {
  try {
    const { productId } = req.params;
    const currentUser = req.payload;
    const { name, description, productImageURL, price } = req.body;

    let newProductImageURL;
    if (productImageURL) {
      newProductImageURL = productImageURL;
    } else {
      newProductImageURL = currentUser.productImageURL;
    }

    const newProductInfo = { name, description, productImageURL: newProductImageURL, price };

    const updatedProduct = await Product.findByIdAndUpdate(productId, newProductInfo, { new: true });

    res.status(200).json(updatedProduct);
  } catch (error) {
    next(error);
  }
});

// * Delete a product (admin only) - Tested successfully
router.delete("/api/products/:productId", isAuthenticated, isAdmin, async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({ message: "Invalid object id" });
      return;
    }

    await Product.findByIdAndDelete(productId);

    res.status(204).send(); // No Content
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
