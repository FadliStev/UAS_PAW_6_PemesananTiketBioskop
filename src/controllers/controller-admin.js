module.exports = {
    dashboard(req, res) {
      res.render("admin/dashboard", {
        url: "http://localhost:5050/",
        username: req.session.username,
      });
    },
    // Tambahkan fungsi admin lainnya di sini
  };
  