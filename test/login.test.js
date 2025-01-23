const mysql = require("mysql");

// Mock createPool untuk mengembalikan pool dengan method 'on'
const mockPool = {
  on: jest.fn(),
  getConnection: jest.fn(),
};

// Mock mysql createPool
mysql.createPool = jest.fn(() => mockPool);

const LoginController = require("../src/controllers/controller-loginn"); // Ganti dengan path yang sesuai

// Mock konfigurasi database
jest.mock("../src/configs/database", () => ({
  host: "localhost",
  user: "test",
  password: "test",
  database: "test_db",
}));

describe("Controller Login", () => {
  let mockRequest;
  let mockResponse;
  let mockKoneksi;

  beforeEach(() => {
    // Reset semua mock sebelum setiap test
    jest.clearAllMocks();

    // Mock objek request
    mockRequest = {
      body: {
        email: "test@contoh.com",
        pass: "password123",
      },
      flash: jest.fn(),
      session: {},
    };

    // Mock objek response
    mockResponse = {
      render: jest.fn(),
      redirect: jest.fn(),
      clearCookie: jest.fn(),
    };

    // Mock koneksi database
    mockKoneksi = {
      query: jest.fn(),
      release: jest.fn(),
    };

    // Setup mock getConnection
    mockPool.getConnection.mockImplementation((callback) =>
      callback(null, mockKoneksi)
    );
  });

  describe("login", () => {
    it("harus merender halaman login dengan URL yang benar", () => {
      LoginController.login(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith("login", {
        url: "http://localhost:5050/",
        colorFlash: undefined,
        statusFlash: undefined,
        pesanFlash: undefined,
      });
    });
  });

  describe("loginAuth", () => {
    it("harus menangani login dengan kredensial kosong", () => {
      mockRequest.body.email = "";
      mockRequest.body.pass = "";

      LoginController.loginAuth(mockRequest, mockResponse);

      expect(mockRequest.flash).toHaveBeenCalledWith("color", "danger");
      expect(mockRequest.flash).toHaveBeenCalledWith("status", "Oops..");
      expect(mockRequest.flash).toHaveBeenCalledWith(
        "message",
        "Email dan Password tidak boleh kosong"
      );
      expect(mockResponse.redirect).toHaveBeenCalledWith("/login");
    });

    it("harus menangani error koneksi database", () => {
      const errorDatabase = new Error("Koneksi database gagal");
      mockPool.getConnection.mockImplementation((callback) =>
        callback(errorDatabase)
      );

      LoginController.loginAuth(mockRequest, mockResponse);

      expect(mockRequest.flash).toHaveBeenCalledWith("color", "danger");
      expect(mockRequest.flash).toHaveBeenCalledWith("status", "Oops..");
      expect(mockRequest.flash).toHaveBeenCalledWith(
        "message",
        "Terjadi kesalahan koneksi ke database"
      );
      expect(mockResponse.redirect).toHaveBeenCalledWith("/login");
    });

    it("harus berhasil login sebagai admin", () => {
      mockKoneksi.query.mockImplementation((query, values, callback) => {
        callback(null, [{ id: 1, nama: "Admin" }]);
      });

      LoginController.loginAuth(mockRequest, mockResponse);

      expect(mockRequest.session.loggedin).toBe(true);
      expect(mockRequest.session.userid).toBe(1);
      expect(mockRequest.session.username).toBe("Admin");
      expect(mockRequest.session.role).toBe("admin");
      expect(mockResponse.redirect).toHaveBeenCalledWith("/admin/dashboard");
    });

    it("harus berhasil login sebagai user", () => {
      mockKoneksi.query.mockImplementation((query, values, callback) => {
        if (query.includes("admin")) {
          callback(null, []);
        } else {
          callback(null, [{ id: 2, nama: "User " }]);
        }
      });

      LoginController.loginAuth(mockRequest, mockResponse);

      expect(mockRequest.session.loggedin).toBe(true);
      expect(mockRequest.session.userid).toBe(2);
      expect(mockRequest.session.username).toBe("User ");
      expect(mockRequest.session.role).toBe("user");
      expect(mockResponse.redirect).toHaveBeenCalledWith("/");
    });

    it("harus menangani login dengan kredensial yang tidak valid", () => {
      mockKoneksi.query.mockImplementation((query, values, callback) => {
        callback(null, []);
      });

      LoginController.loginAuth(mockRequest, mockResponse);

      expect(mockRequest.flash).toHaveBeenCalledWith("color", "danger");
      expect(mockRequest.flash).toHaveBeenCalledWith("status", "Oops..");
      expect(mockRequest.flash).toHaveBeenCalledWith(
        "message",
        "Akun tidak ditemukan"
      );
      expect(mockResponse.redirect).toHaveBeenCalledWith("/login");
    });

    it("harus menangani error query untuk admin", () => {
      const errorQuery = new Error("Query gagal");
      mockKoneksi.query.mockImplementation((query, values, callback) => {
        callback(errorQuery);
      });

      LoginController.loginAuth(mockRequest, mockResponse);

      expect(mockRequest.flash).toHaveBeenCalledWith("color", "danger");
      expect(mockRequest.flash).toHaveBeenCalledWith("status", "Oops..");
      expect(mockRequest.flash).toHaveBeenCalledWith(
        "message",
        "Terjadi kesalahan saat memproses permintaan"
      );
      expect(mockResponse.redirect).toHaveBeenCalledWith("/login");
    });

    it("harus menangani error query untuk user", () => {
      mockKoneksi.query.mockImplementation((query, values, callback) => {
        if (query.includes("users")) {
          callback(new Error("Query gagal"));
        } else {
          callback(null, []);
        }
      });

      LoginController.loginAuth(mockRequest, mockResponse);

      expect(mockRequest.flash).toHaveBeenCalledWith("color", "danger");
      expect(mockRequest.flash).toHaveBeenCalledWith("status", "Oops..");
      expect(mockRequest.flash).toHaveBeenCalledWith(
        "message",
        "Terjadi kesalahan saat memproses permintaan"
      );
      expect(mockResponse.redirect).toHaveBeenCalledWith("/login");
    });
  });

  describe("logout", () => {
    it("harus menghancurkan session dan redirect ke login", () => {
      mockRequest.session.destroy = jest.fn((callback) => callback(null));

      LoginController.logout(mockRequest, mockResponse);

      expect(mockRequest.session.destroy).toHaveBeenCalled();
      expect(mockResponse.clearCookie).toHaveBeenCalledWith("secretname");
      expect(mockResponse.redirect).toHaveBeenCalledWith("/login");
    });

    it("harus menangani error saat menghancurkan session", () => {
      const errorSession = new Error("Error menghancurkan session");
      mockRequest.session.destroy = jest.fn((callback) =>
        callback(errorSession)
      );

      console.log = jest.fn(); // Mock console.log untuk menangkap log error

      LoginController.logout(mockRequest, mockResponse);

      expect(console.log).toHaveBeenCalledWith(errorSession);
      expect(mockResponse.clearCookie).toHaveBeenCalledWith("secretname");
      expect(mockResponse.redirect).toHaveBeenCalledWith("/login");
    });
  });
});