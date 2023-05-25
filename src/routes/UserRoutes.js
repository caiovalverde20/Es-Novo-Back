const router = require('express').Router();
const UserController = require('../controllers/UserController');
const multer = require('multer');
const multerConfig = require('../middlewares/Multer');
const authController = require('../middlewares/Auth');

router.post('/login', UserController.login);
router.post('/user/:admId', authController.authorizeAdm, UserController.createUser);

router.post('/user/image/:id', multer(multerConfig).single('file'), UserController.addProfilePicture);
router.delete('/user/image/:id', multer(multerConfig).single('file'), UserController.removeProfilePicture);

router.post('/RequestPasswordRecovery', UserController.RequestPasswordRecovery);
router.put('/PasswordRecovery/:email', UserController.PasswordRecovery);


module.exports = router;
