const router = require('express').Router();
const UserController = require('@controllers/UserController');
const authController = require('@middlewares/Auth');

router.post('/user/:admId', authController.authorizeAdm, UserController.createUser);
router.post('/login', UserController.login);


module.exports = router;
