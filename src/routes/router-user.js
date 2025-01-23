const router = require("express").Router();
const verifyUser = require("../configs/verify");

// Gunakan middleware verifyUser.isUser untuk setiap route
router.use((req, res, next) => {
  verifyUser.isUser(req, res, next);
});

// Route home user
router.get("/", (req, res) => {
  res.render("home", {
    url: "http://localhost:5050/",
    username: req.session.username,
  });
});

// Route home user (redirect dari /home ke /)
router.get("/home", (req, res) => {
  res.redirect("/");
});

// Route profile user
router.get("/profile", (req, res) => {
  res.render("profile", {
    url: "http://localhost:5050/",
    username: req.session.username,
  });
});

// Route login page dengan redirect ke home
router.get("/login", (req, res) => {
  if (req.session.username) {
    res.redirect("/");
  } else {
    res.render("login", {
      url: "http://localhost:5050/",
    });
  }
});

// Route register page
router.get("/register", (req, res) => {
  if (req.session.username) {
    res.redirect("/");
  } else {
    res.render("register", {
      url: "http://localhost:5050/",
    });
  }
});

// Route todos page
router.get("/todos", (req, res) => {
  res.render("todos", {
    url: "http://localhost:5050/",
    username: req.session.username,
  });
});

module.exports = router;
