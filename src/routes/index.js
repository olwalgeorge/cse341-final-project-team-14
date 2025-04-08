// src/routes/index.js
const express = require("express");
const userRoutes = require("./users.routes.js");
const authRoutes = require("./auth.routes.js");
const productRoutes = require('./productsRoutes.js')

const path = require('path');

const router = express.Router();


router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html')); 
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use('/', productRoutes)


module.exports = router;
