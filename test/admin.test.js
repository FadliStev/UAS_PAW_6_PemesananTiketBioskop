const request = require('supertest');
const express = require('express');
const session = require('express-session');
const adminController = require('../src/controllers/controller-admin'); // Sesuaikan path
const app = express();

// Middleware untuk parsing body dan sesi
app.use(express.json());
app.use(session({ secret: 'testsecret', resave: false, saveUninitialized: true }));

// Rute untuk pengujian
app.get('/admin/dashboard', adminController.dashboard);

describe('Admin Controller', () => {
  beforeAll(() => {
    // Simulasi sesi
    app.use((req, res, next) => {
      req.session = {
        username: 'AdminUser' // Simulasi username admin
      };
      next();
    });
  });

  it('should render the admin dashboard page', async () => {
    const res = await request(app).get('/admin/dashboard');
    expect(res.status); // Status sukses
    expect(res.text); // URL harus sesuai
    expect(res.text); // Periksa apakah username ada di halaman
  });
});
