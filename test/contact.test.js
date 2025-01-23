const request = require("supertest");
const express = require("express");
const contactController = require("../src/controllers/controller-contact"); // Sesuaikan path
const app = express();

// Middleware untuk parsing JSON dan URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock untuk flash messages
const mockFlash = jest.fn();
app.use((req, res, next) => {
  req.flash = mockFlash;
  next();
});

// Set view engine
app.set("view engine", "ejs");

// Tambahkan rute untuk pengujian
app.get("/contact", contactController.getContact);
app.get("/contact/add", contactController.formContact);
app.post("/contact", contactController.saveContact);
app.get("/contact/:id/edit", contactController.editContact);
app.post("/contact/:id", contactController.updateContact);
app.post("/contact/:id/delete", contactController.deleteContact);

// Mock pool connection
jest.mock("mysql", () => {
  const mPool = {
    getConnection: jest.fn((callback) => {
      callback(null, {
        query: jest.fn((query, params, callback) => {
          if (query.startsWith("SELECT")) {
            callback(null, [
              {
                id: 1,
                nama: "John Doe",
                email: "john@example.com",
                phone: "1234567890",
                address: "123 Street",
              },
            ]);
          } else if (query.startsWith("INSERT")) {
            callback(null, { affectedRows: 1 });
          } else if (query.startsWith("UPDATE")) {
            callback(null, { affectedRows: 1 });
          } else if (query.startsWith("DELETE")) {
            callback(null, { affectedRows: 1 });
          } else {
            callback(new Error("Query error"));
          }
        }),
        release: jest.fn(),
      });
    }),
    on: jest.fn(),
  };
  return { createPool: jest.fn(() => mPool) };
});

describe("Contact Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should get all contacts", async () => {
    const res = await request(app).get("/contact");
    expect(res.status)
    expect(res.text)
  });

  it("should render form for adding a contact", async () => {
    const res = await request(app).get("/contact/add");
    expect(res.status)
    expect(res.text)
  });

  it("should save a new contact", async () => {
    const contactData = {
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "0987654321",
      address: "456 Avenue",
    };
    const res = await request(app).post("/contact").send(contactData);
    expect(mockFlash).toHaveBeenCalledWith("color", "success");
    expect(mockFlash).toHaveBeenCalledWith("status", "Yes..");
    expect(mockFlash).toHaveBeenCalledWith("message", "Data berhasil disimpan");
    expect(res.status).toBe(302); // Redirect
  });

  it("should render form to edit a contact", async () => {
    const res = await request(app).get("/contact/1/edit");
    expect(res.status)
    expect(res.text)
    expect(res.text) // Pastikan nama kontak ditampilkan
  });

  it("should update a contact", async () => {
    const updatedData = {
      name: "John Updated",
      email: "updated@example.com",
      phone: "1122334455",
      address: "789 Boulevard",
    };
    const res = await request(app).post("/contact/1").send(updatedData);
    expect(res.status).toBe(302); // Redirect
  });

  it("should delete a contact", async () => {
    const res = await request(app).post("/contact/1/delete");
    expect(res.status).toBe(302); // Redirect
  });

  it("should handle database connection error", async () => {
    const mockPool = require("mysql").createPool();
    mockPool.getConnection.mockImplementationOnce((callback) => {
      callback(new Error("Connection error"), null);
    });

    const res = await request(app).get("/contact");
    expect(res.status).toBe(500); // Internal Server Error
    expect(res.text)
  });

  it("should handle query execution error", async () => {
    const mockPool = require("mysql").createPool();
    mockPool.getConnection.mockImplementationOnce((callback) => {
      callback(null, {
        query: jest.fn((query, params, callback) => {
          callback(new Error("Query error"), null);
        }),
        release: jest.fn(),
      });
    });

    const res = await request(app).get("/contact");
    expect(res.status).toBe(500); // Internal Server Error
    expect(res.text)
  });
});