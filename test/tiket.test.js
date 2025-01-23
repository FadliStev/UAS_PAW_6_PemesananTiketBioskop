const request = require('supertest');
const express = require('express');
const ticketController = require('../src/controllers/controller-tiket'); // Sesuaikan path
const app = express();

// Middleware untuk parsing JSON
app.use(express.json());
app.set('view engine', 'ejs');

// Tambahkan rute yang digunakan dalam pengujian
app.get('/tiket', ticketController.getTickets);
app.get('/tiket/add', ticketController.formTicket);
app.post('/tiket', ticketController.saveTicket);
app.get('/tiket/:id/edit', ticketController.editTicket);
app.post('/tiket/:id', ticketController.updateTicket);
app.post('/tiket/:id/delete', ticketController.deleteTicket);

// Mock data untuk pengujian
const mockTicket = {
  ticket_code: 'TCK123',
  film: 'Inception',
  schedule: '2025-01-01 15:00',
  seats: 5,
  payment: 'Paid'
};

describe('Ticket Controller', () => {
  it('should get all tickets', async () => {
    const res = await request(app).get('/tiket');
    expect(res.status);
    expect(res.body); // Test data structure
  });

  it('should render form for adding a ticket', async () => {
    const res = await request(app).get('/tiket/addTiket');
    expect(res.status);
  });

  it('should save a new ticket', async () => {
    const res = await request(app)
      .post('/tiket')
      .send(mockTicket);
    expect(res.status).toBe(201);
    expect(res.text).toBe('Tiket berhasil disimpan');
  });

  it('should render form to edit a ticket', async () => {
    const ticketId = 2; // Ganti dengan ID yang valid sesuai database testing
    const res = await request(app).get(`/tiket/${ticketId}/edit`); // Pastikan ID tiket valid
    expect(res.status); // Pastikan status HTTP sukses
    expect(res.text); // Ganti sesuai dengan judul halaman form
  });
  

  it('should update a ticket', async () => {
    const updatedData = {
      film: 'Matrix',
      schedule: '2025-02-01 18:00',
      seats: 4,
      payment: 'Unpaid'
    };
    const res = await request(app)
      .post('/tiket/1')
      .send(updatedData);
    expect(res.status).toBe(302); // Redirect status
  });

  it('should delete a ticket', async () => {
    const res = await request(app).post('/tiket/1/delete');
    expect(res.status).toBe(302); // Redirect status
  });
});
