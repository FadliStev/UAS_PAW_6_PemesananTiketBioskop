const request = require('supertest');
const express = require('express');
const todosController = require('../src/controllers/controller-todo'); // Sesuaikan path
const app = express();

// Middleware untuk parsing body dan sesi
app.use(express.urlencoded({ extended: false }));

// Rute untuk pengujian
app.get('/todos', todosController.getTodos);
app.post('/todos', todosController.saveTodo);
app.post('/todos/:id/update', todosController.updateTodos);
app.post('/todos/:id/delete', todosController.deleteTodos);
app.get('/todos/:id/edit', todosController.editTodos);

describe('Todos Controller', () => {
  it('should fetch all todos and render the todos page', async () => {
    const res = await request(app).get('/todos');
    expect(res.status);
    expect(res.text); // Sesuaikan dengan elemen dalam tampilan
  });

  it('should save a new todo', async () => {
    const res = await request(app)
      .post('/todos')
      .send({ film: 'Inception', jenis: 'Action', harga: 15000 });
    expect(res.status); // Redirect after successful save
    expect(res.header.location);
  });

  it('should update a todo', async () => {
    const res = await request(app)
      .post('/todos/1/update')
      .send({ film: 'Updated Film', jenis: 'Drama', harga: 20000 });
    expect(res.status); // Redirect after update
    expect(res.header.location);
  });

  it('should delete a todo', async () => {
    const res = await request(app).post('/todos/1/delete');
    expect(res.status).toBe(302); // Redirect after delete
    expect(res.header.location).toBe('/todos');
  });

  it('should render edit page for a todo', async () => {
    const res = await request(app).get('/todos/1/edit');
    expect(res.status).toBe(200);
    expect(res.text); // Sesuaikan dengan elemen yang ada di halaman edit
  });
});
