const router = require("express").Router();
const adminController = require("../controllers/controller-admin");
const verifyUser = require("../configs/verify");

// Gunakan middleware verifyUser.isAdmin untuk setiap route
router.use((req, res, next) => {
  verifyUser.isAdmin(req, res, next);
});

// Define routes
router.get("/dashboard", (req, res) => {
  res.render("admin/dashboard", {
    url: "http://localhost:5050/",
    username: req.session.username,
  });
});

// Tambahkan route admin lainnya di sini
router.get("/manage-users", (req, res) => {
  res.render("admin/manage-users", {
    url: "http://localhost:5050/",
    username: req.session.username,
  });
});

module.exports = router;
