const router = require('express').Router();
const UserController = require('../controllers/UserController');
const authController = require('../middlewares/Auth');

router.post('/login', UserController.login);
router.post('/user/:admId', authController.authorizeAdm, UserController.createUser);

router.post('/RequestPasswordRecovery', UserController.RequestPasswordRecovery);
router.put('/PasswordRecovery/:email', UserController.PasswordRecovery);


module.exports = router;
