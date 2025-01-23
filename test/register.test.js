const mysql = require("mysql");

// Mock createPool untuk mengembalikan pool dengan method 'on'
const mockPool = {
  on: jest.fn(),
  getConnection: jest.fn(),
};

// Mock mysql createPool
mysql.createPool = jest.fn(() => mockPool);

const RegisterController = require("../src/controllers/controller-register");

// Mock konfigurasi database
jest.mock("../src/configs/database", () => ({
  host: "localhost",
  user: "test",
  password: "test",
  database: "test_db",
}));

describe("Controller Register", () => {
  let mockRequest;
  let mockResponse;
  let mockKoneksi;

  beforeEach(() => {
    // Reset semua mock sebelum setiap test
    jest.clearAllMocks();

    // Mock objek request
    mockRequest = {
      body: {
        username: "pengguna_test",
        email: "test@contoh.com",
        pass: "password123",
      },
      flash: jest.fn(),
    };

    // Mock objek response
    mockResponse = {
      render: jest.fn(),
      redirect: jest.fn(),
      end: jest.fn(),
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

  describe("formRegister", () => {
    it("harus merender halaman register dengan URL yang benar", () => {
      RegisterController.formRegister(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith("register", {
        url: "http://localhost:5050/",
      });
    });
  });

  describe("saveRegister", () => {
    it("harus berhasil mendaftarkan pengguna baru", () => {
      // Mock eksekusi query yang berhasil
      mockKoneksi.query.mockImplementation((query, values, callback) => {
        callback(null, { insertId: 1 });
      });

      RegisterController.saveRegister(mockRequest, mockResponse);

      // Verifikasi query database
      expect(mockKoneksi.query).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO users"),
        ["pengguna_test", "test@contoh.com", "password123"],
        expect.any(Function)
      );

      // Verifikasi pesan flash
      expect(mockRequest.flash).toHaveBeenCalledWith("color", "success");
      expect(mockRequest.flash).toHaveBeenCalledWith("status", "Yes..");
      expect(mockRequest.flash).toHaveBeenCalledWith(
        "message",
        "Registrasi berhasil"
      );

      // Verifikasi redirect
      expect(mockResponse.redirect).toHaveBeenCalledWith("/login");

      // Verifikasi pelepasan koneksi
      expect(mockKoneksi.release).toHaveBeenCalled();
    });

    it("harus redirect ke login jika ada field yang kosong", () => {
      mockRequest.body = {
        username: "",
        email: "",
        pass: "",
      };

      RegisterController.saveRegister(mockRequest, mockResponse);

      // Verifikasi bahwa tidak ada query database yang dijalankan
      expect(mockKoneksi.query).not.toHaveBeenCalled();

      // Verifikasi redirect ke login
      expect(mockResponse.redirect).toHaveBeenCalledWith("/login");
    });

    it("harus menangani error koneksi database", () => {
      // Mock error koneksi database
      const errorDatabase = new Error("Koneksi database gagal");
      mockPool.getConnection.mockImplementation((callback) =>
        callback(errorDatabase)
      );

      // Ekspektasi function akan throw error
      expect(() => {
        RegisterController.saveRegister(mockRequest, mockResponse);
      }).toThrow(errorDatabase);
    });

    it("harus menangani error query", () => {
      // Mock error query
      const errorQuery = new Error("Query gagal");
      mockKoneksi.query.mockImplementation((query, values, callback) => {
        callback(errorQuery);
      });

      // Ekspektasi function akan throw error
      expect(() => {
        RegisterController.saveRegister(mockRequest, mockResponse);
      }).toThrow(errorQuery);
    });
  });
});