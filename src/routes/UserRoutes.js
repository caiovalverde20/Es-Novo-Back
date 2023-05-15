const router = require('express').Router();
const UserController = require('../controllers/UserController');
const authController = require('../middlewares/Auth');

router.post('/login', UserController.login);
router.post('/user/:admId', authController.authorizeAdm, UserController.createUser);


module.exports = router;
