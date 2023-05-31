const router = require('express').Router();
const TagController = require('../controllers/TagController');
const authController = require('../middlewares/Auth');

router.post('/tag/:admId', authController.authorizeAdm, TagController.createTag);
router.get('/tag/all/', TagController.getAllTags);
router.get('/tag/find/:name', TagController.getTagByName);   

module.exports = router;
