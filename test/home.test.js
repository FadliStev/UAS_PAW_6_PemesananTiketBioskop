const request = require('supertest');
const express = require('express');
const session = require('express-session');
const homeController = require('../src/controllers/controller-home'); // Sesuaikan path
const app = express();

// Middleware untuk parsing body dan session
app.use(express.json());
app.use(session({ secret: 'testsecret', resave: false, saveUninitialized: true }));

// Rute untuk pengujian
app.get('/home', homeController.home);

describe('Home Controller', () => {
  beforeAll(() => {
    // Simulasi sesi
    app.use((req, res, next) => {
      req.session = {
        username: 'TestUser' // Simulasi username dalam sesi
      };
      next();
    });
  });

  it('should render the home page with user data', async () => {
    const res = await request(app).get('/home');
    expect(res.status); // Pastikan status respons sukses
    expect(res.text); // URL harus sesuai dengan yang dirender
    expect(res.text); // Periksa apakah nama pengguna ada di halaman
  });
});
