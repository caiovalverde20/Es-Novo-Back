const router = require('express').Router();
const TagController = require('../controllers/TagController');
const authController = require('../middlewares/Auth');

router.post('/tag/:userId', authController.authorizeAdm, TagController.createTag);
router.get('/tag/all/', TagController.getAllTags);

module.exports = router;
