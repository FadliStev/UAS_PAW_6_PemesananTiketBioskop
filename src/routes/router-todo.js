const router = require("express").Router();
const todosController = require("../controllers/controller-todo");
const verifyUser = require("../configs/verify");

// Rute untuk mengelola data Vespa
router.get("/", verifyUser.isLogin, todosController.getTodos);
router.post("/save", verifyUser.isLogin, todosController.saveTodo);
router.get("/edit/:id", verifyUser.isLogin, todosController.editTodos);
router.post("/update/:id", verifyUser.isLogin, todosController.updateTodos);
router.get("/delete/:id", verifyUser.isLogin, todosController.deleteTodos);

module.exports = router;
