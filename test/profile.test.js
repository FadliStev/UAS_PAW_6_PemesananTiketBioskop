const request = require("supertest");
const express = require("express");
const profileController = require("../src/controllers/controller-profile"); // Sesuaikan path
const app = express();

// Middleware untuk parsing JSON dan URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock session
const mockSession = {
  userid: 1,
  username: "testuser",
};
app.use((req, res, next) => {
  req.session = mockSession;
  next();
});

// Mock view rendering
app.use((req, res, next) => {
  res.render = jest.fn((view, options) => {
    res.status(200).send({ view, options }); // Simulasikan pengembalian view dan data
  });
  next();
});

// Tambahkan rute untuk pengujian
app.get("/profile", profileController.profile);

// Mock pool connection
jest.mock("mysql", () => {
  const mPool = {
    getConnection: jest.fn((callback) => {
      callback(null, {
        query: jest.fn((query, params, callback) => {
          if (query.includes("SELECT")) {
            callback(null, [
              { nama: "John Doe", email: "john.doe@example.com" },
            ]);
          } else {
            callback(new Error("Query error"), null);
          }
        }),
        release: jest.fn(),
      });
    }),
    on: jest.fn(),
  };
  return { createPool: jest.fn(() => mPool) };
});

describe("Profile Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render profile page with user data", async () => {
    const res = await request(app).get("/profile");
    expect(res.status);
    expect(res.body.view);
    expect(res.body.options);
  });

  it("should handle database connection error", async () => {
    const mockPool = require("mysql").createPool();
    mockPool.getConnection.mockImplementationOnce((callback) => {
      callback(new Error("Connection error"), null);
    });

    const res = await request(app).get("/profile");
    expect(res.status).toBe(500); // Internal Server Error
    expect(res.text).toContain("Connection error");
  });

  it("should handle query error", async () => {
    const mockPool = require("mysql").createPool();
    mockPool.getConnection.mockImplementationOnce((callback) => {
      callback(null, {
        query: jest.fn((query, params, callback) => {
          callback(new Error("Query error"), null);
        }),
        release: jest.fn(),
      });
    });

    const res = await request(app).get("/profile");
    expect(res.status).toBe(500); // Internal Server Error
    expect(res.text);
  });
});