// controllers/controller-todos.js
const mysql = require("mysql2/promise");
const dbConfig = require("../configs/database"); // Memastikan koneksi database menggunakan pool
const pool = mysql.createPool(dbConfig);

module.exports = {
  // Fungsi untuk mengambil data Todos
  async getTodos(req, res) {
    try {
      const [results] = await pool.execute("SELECT * FROM todos;");
      res.render("todos", {
        url: "http://localhost:5050/",
        todos: results.length > 0 ? results : [],
      });
    } catch (err) {
      console.error("Error saat query:", err);
      res.status(500).send("Gagal mengambil data Todos");
    }
  },

  // Fungsi untuk menyimpan data Todos
  async saveTodo(req, res) {
    const { film, jenis, harga } = req.body;
    console.log({ film, jenis, harga }); // Memeriksa data yang diterima

    if (film && jenis && harga) {
      try {
        await pool.execute(
          "INSERT INTO todos (film, jenis, harga) VALUES (?, ?, ?);",
          [film, jenis, harga]
        );
        req.flash("color", "success");
        req.flash("status", "Yes..");
        req.flash("message", "Data berhasil disimpan");
        res.redirect("/todos");
      } catch (err) {
        console.error("Error saat menyimpan data:", err);
        res.send("Gagal menyimpan data");
      }
    } else {
      res.send("Data tidak lengkap");
    }
  },

  // Fungsi untuk memperbarui data Todos
  async updateTodos(req, res) {
    const { id } = req.params;
    const { film, jenis, harga } = req.body;
    try {
      await pool.execute(
        "UPDATE todos SET film = ?, jenis = ?, harga = ? WHERE id = ?",
        [film, jenis, harga, id]
      );
      res.redirect("/todos");
    } catch (err) {
      console.error("Error saat memperbarui data:", err);
      res.send("Gagal memperbarui data");
    }
  },

  // Fungsi untuk menghapus data Todos
  async deleteTodos(req, res) {
    const { id } = req.params;
    try {
      await pool.execute("DELETE FROM todos WHERE id = ?", [id]);
      res.redirect("/todos");
    } catch (err) {
      console.error("Error saat menghapus data:", err);
      res.send("Gagal menghapus data");
    }
  },

  // Fungsi untuk menampilkan halaman edit Todos
  async editTodos(req, res) {
    const { id } = req.params;
    try {
      const [results] = await pool.execute("SELECT * FROM todos WHERE id = ?", [
        id,
      ]);
      res.render("/todos", { todos: results[0] });
    } catch (err) {
      console.error("Error saat mengambil data untuk edit:", err);
      res.send("Gagal mengambil data Todos");
    }
  },
};
