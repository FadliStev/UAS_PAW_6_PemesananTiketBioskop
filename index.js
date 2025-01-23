// Definisi Library yang digunakan
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const flash = require("connect-flash"); // Memilih satu library flash
const app = express();

// Definisi lokasi file router
const loginRoutes = require("./src/routes/router-login");
const registerRoutes = require("./src/routes/router-register");
const contactRoutes = require("./src/routes/router-contact");
const todosRoutes = require("./src/routes/router-todo");
const appRoutes = require("./src/routes/router-app");
const tiketRoutes = require("./src/routes/router-tiket");
const adminRoutes = require("./src/routes/router-admin");
const userRoutes = require("./src/routes/router-user");

// Konfigurasi library session
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: "t@1k0ch3ng",
    name: "secretName",
    cookie: {
      sameSite: true,
      maxAge: 60000, // Sesuaikan dengan kebutuhan
    },
  })
);

// Configurasi dan gunakan library
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(flash()); // Gunakan connect-flash untuk pesan flash

// Set headers untuk menghindari caching
app.use(function (req, res, next) {
  res.setHeader(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  res.setHeader("Pragma", "no-cache");
  next();
});

app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.loggedin || false;
  res.locals.username = req.session.username || null;
  res.locals.role = req.session.role || null;
  res.locals.url = "/";
  next();
});

app.get("/team", (req, res) => {
  res.render("team");
});

// Configurasi static folder untuk public assets
app.use("/public", express.static(path.join(__dirname, "public")));

// Setting folder views dan view engine
app.set("views", path.join(__dirname, "src/views"));
app.set("view engine", "ejs");

// Gunakan routes yang telah didefinisikan
app.use("/login", loginRoutes);
app.use("/register", registerRoutes);
app.use("/contact", contactRoutes);
app.use("/todos", todosRoutes);
app.use("/tiket", tiketRoutes);
app.use("/", appRoutes);

const verifyUser = require("./src/configs/verify");

app.use("/admin", verifyUser.isLogin, adminRoutes);

// User routes
app.use("/user", verifyUser.isLogin, userRoutes);

// Middleware untuk penanganan error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.get("/upcoming", (req, res) => {
  res.render("upcoming");
});

// Gunakan port server
app.listen(5050, () => {
  console.log("Server Berjalan di Port : " + 5050);
});
