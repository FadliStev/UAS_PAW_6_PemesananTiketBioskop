const config = require("../configs/database");
let mysql = require("mysql");
let pool = mysql.createPool(config);

// Penanganan error pada pool
pool.on("error", (err) => {
  console.error("Database pool error:", err);
});

module.exports = {
  // Mengambil semua tiket
  getTickets(req, res) {
    pool.getConnection(function (err, connection) {
      if (err) {
        console.error("Error mendapatkan koneksi database:", err);
        return res.status(500).send("Gagal terhubung ke database");
      }

      connection.query("SELECT * FROM tickets;", function (error, results) {
        connection.release(); // Pastikan koneksi dilepaskan

        if (error) {
          console.error("Error mengambil data tiket:", error);
          return res.status(500).send("Gagal mengambil data tiket");
        }

        res.render("tiket", {
          url: "http://localhost:5050/",
          tickets: results.length > 0 ? results : [],
        });
      });
    });
  },

  // Menampilkan form tambah tiket
  formTicket(req, res) {
    res.render("addTiket", {
      url: "http://localhost:5050/",
    });
  },

  // Menyimpan tiket baru
  saveTicket(req, res) {
    const { ticket_code, film, schedule, seats, payment } = req.body;

    // Validasi data
    if (!ticket_code || !film || !schedule || !seats || !payment) {
      return res.status(400).send("Data tidak lengkap");
    }

    pool.getConnection(function (err, connection) {
      if (err) {
        console.error("Error mendapatkan koneksi database:", err);
        return res.status(500).send("Gagal terhubung ke database");
      }

      const query = `
        INSERT INTO tickets 
        (ticket_code, film, schedule, seats, payment) 
        VALUES (?, ?, ?, ?, ?)
      `;

      connection.query(
        query,
        [ticket_code, film, schedule, seats, payment],
        function (error, results) {
          connection.release(); // Pastikan koneksi dilepaskan

          if (error) {
            console.error("Error menyimpan tiket:", error);
            return res.status(500).send("Gagal menyimpan tiket");
          }

          res.status(201).send("Tiket berhasil disimpan");
        }
      );
    });
  },

  // Menampilkan form edit tiket
  editTicket(req, res) {
    const { id } = req.params;

    pool.getConnection(function (err, connection) {
      if (err) {
        console.error("Error mendapatkan koneksi database:", err);
        return res.status(500).send("Gagal terhubung ke database");
      }

      connection.query(
        "SELECT * FROM tickets WHERE id = ?",
        [id],
        function (error, results) {
          connection.release(); // Pastikan koneksi dilepaskan

          if (error) {
            console.error("Error mengambil data tiket:", error);
            return res.status(500).send("Gagal mengambil data tiket");
          }

          if (results.length > 0) {
            res.render("editTiket", {
              url: "http://localhost:5050/",
              ticket: results[0],
            });
          } else {
            res.status(404).send("Tiket tidak ditemukan");
          }
        }
      );
    });
  },

  // Mengupdate tiket
  updateTicket(req, res) {
    const { id } = req.params;
    const { film, schedule, seats, payment } = req.body;

    pool.getConnection(function (err, connection) {
      if (err) {
        console.error("Error mendapatkan koneksi database:", err);
        return res.status(500).send("Gagal terhubung ke database");
      }

      const query = `
        UPDATE tickets 
        SET film = ?, 
            schedule = ?, 
            seats = ?, 
            payment = ? 
        WHERE id = ?
      `;

      connection.query(
        query,
        [film, schedule, seats, payment, id],
        function (error, results) {
          connection.release(); // Pastikan koneksi dilepaskan

          if (error) {
            console.error("Error mengupdate tiket:", error);
            return res.status(500).send("Gagal mengupdate tiket");
          }

          res.redirect("/tiket");
        }
      );
    });
  },

  // Menghapus tiket
  deleteTicket(req, res) {
    const { id } = req.params;

    pool.getConnection(function (err, connection) {
      if (err) {
        console.error("Error mendapatkan koneksi database:", err);
        return res.status(500).send("Gagal terhubung ke database");
      }

      connection.query(
        "DELETE FROM tickets WHERE id = ?",
        [id],
        function (error, results) {
          connection.release(); // Pastikan koneksi dilepaskan

          if (error) {
            console.error("Error menghapus tiket:", error);
            return res.status(500).send("Gagal menghapus tiket");
          }

          res.redirect("/tiket");
        }
      );
    });
  },
};
