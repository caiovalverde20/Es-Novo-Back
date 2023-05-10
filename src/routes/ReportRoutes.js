const router = require('express').Router();
const ReportController = require('@controllers/ReportController');
const authController = require('@middlewares/Auth');

router.post('/report/:userId', authController.authorizeUser, ReportController.createReport);
router.get('/report/:userId/:dateStart/:dateEnd', authController.authorizeUser, ReportController.getReportByUser);

module.exports = router;
