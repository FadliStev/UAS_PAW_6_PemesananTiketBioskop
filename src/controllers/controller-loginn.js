const config = require("../configs/database");
const mysql = require("mysql");
const pool = mysql.createPool(config);

pool.on("error", (err) => {
  console.error("MySQL Pool Error:", err);
});

module.exports = {
  login(req, res) {
    res.render("login", {
      url: "http://localhost:5050/",
      colorFlash: req.flash("color"),
      statusFlash: req.flash("status"),
      pesanFlash: req.flash("message"),
    });
  },

  loginAuth(req, res) {
    const email = req.body.email;
    const password = req.body.pass;

    if (!email || !password) {
      req.flash("color", "danger");
      req.flash("status", "Oops..");
      req.flash("message", "Email dan Password tidak boleh kosong");
      return res.redirect("/login");
    }

    pool.getConnection((err, connection) => {
      if (err) {
        console.error("Database Connection Error:", err);
        req.flash("color", "danger");
        req.flash("status", "Oops..");
        req.flash("message", "Terjadi kesalahan koneksi ke database");
        return res.redirect("/login");
      }

      const adminQuery =
        "SELECT * FROM admin WHERE email = ? AND password = SHA2(?, 512)";
      connection.query(adminQuery, [email, password], (error, adminResults) => {
        if (error) {
          console.error("Admin Query Error:", error);
          connection.release();
          req.flash("color", "danger");
          req.flash("status", "Oops..");
          req.flash("message", "Terjadi kesalahan saat memproses permintaan");
          return res.redirect("/login");
        }

        if (adminResults && adminResults.length > 0) {
          req.session.loggedin = true;
          req.session.userid = adminResults[0].id;
          req.session.username = adminResults[0].nama;
          req.session.role = "admin";
          return res.redirect("/admin/dashboard");
        }

        const userQuery =
          "SELECT * FROM users WHERE email = ? AND password = SHA2(?, 512)";
        connection.query(userQuery, [email, password], (error, userResults) => {
          connection.release(); // Pastikan koneksi dilepaskan di sini

          if (error) {
            console.error("User  Query Error:", error);
            req.flash("color", "danger");
            req.flash("status", "Oops..");
            req.flash("message", "Terjadi kesalahan saat memproses permintaan");
            return res.redirect("/login");
          }

          if (userResults.length > 0) {
            req.session.loggedin = true;
            req.session.userid = userResults[0].id;
            req.session.username = userResults[0].nama;
            req.session.role = "user";
            return res.redirect("/");
          } else {
            req.flash("color", "danger");
            req.flash("status", "Oops..");
            req.flash("message", "Akun tidak ditemukan");
            return res.redirect("/login");
          }
        });
      });
    });
  },

  logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      }
      res.clearCookie("secretname");
      res.redirect("/login");
    });
  },
};