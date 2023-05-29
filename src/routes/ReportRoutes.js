const router = require('express').Router();
const ReportController = require('../controllers/ReportController');
const authController = require('../middlewares/Auth');

router.post('/report/:userId', authController.authorizeUser, ReportController.createReport);

router.delete('/report/:userId/:reportId', authController.authorizeUser, ReportController.deleteReport);

router.put('/report/:userId/:reportId', authController.authorizeUser, ReportController.updateReport);

router.get('/report/:userId/:dateStart/:dateEnd', authController.authorizeUser, ReportController.getReportByUser);

router.get('/report/all/:userId/:dateStart/:dateEnd', authController.authorizeAdm, ReportController.getAllReportsByDate);

module.exports = router;
