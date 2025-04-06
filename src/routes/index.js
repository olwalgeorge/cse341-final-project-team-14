// src/routes/index.js
const express = require("express");
const userRoutes = require("./users.routes.js");
const authRoutes = require("./auth.routes.js");
const productRoutes = require("./products.routes.js");
const supplierRoutes = require("./suppliers.routes.js");
const orderRoutes = require("./orders.routes.js");

const path = require('path');

const router = express.Router();

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html')); 
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/products", productRoutes);
router.use("/suppliers", supplierRoutes);
router.use("/orders", orderRoutes);

module.exports = router;
