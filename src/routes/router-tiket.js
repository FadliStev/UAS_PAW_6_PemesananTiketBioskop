const router = require("express").Router();
const controllerTiket = require("../controllers/controller-tiket"); // Ensure the path is correct
const verifyUser = require("../configs/verify");

router.get("/", verifyUser.isLogin, controllerTiket.getTickets);
router.get("/add", verifyUser.isLogin, controllerTiket.formTicket);
router.post("/save", verifyUser.isLogin, controllerTiket.saveTicket);
router.get("/edit/:id", verifyUser.isLogin, controllerTiket.editTicket);
router.post("/update/:id", verifyUser.isLogin, controllerTiket.updateTicket);
router.get("/delete/:id", verifyUser.isLogin, controllerTiket.deleteTicket);

module.exports = router;
