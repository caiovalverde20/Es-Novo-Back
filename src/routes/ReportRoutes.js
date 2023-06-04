const router = require('express').Router();
const ReportController = require('../controllers/ReportController');
const authController = require('../middlewares/Auth');

router.post('/report/:userId', authController.authorizeUser, ReportController.createReport);

router.delete('/report/:userId/:reportId', authController.authorizeUser, ReportController.deleteReport);

router.put('/report/:userId/:reportId', authController.authorizeUser, ReportController.updateReport);

router.get('/report/:userId/:dateStart/:dateEnd', authController.authorizeUser, ReportController.getReportByUser);
router.get('/report/analytics/:userId/:dateStart/:dateEnd', authController.authorizeUser, ReportController.getReportByUserAnalytics);
router.get('/report/all/analytics/:userId/:dateStart/:dateEnd', authController.authorizeUser, ReportController.getAllReportsAnalytics);
router.get('/report/all/:userId/:dateStart/:dateEnd', authController.authorizeAdm, ReportController.getAllReportsByDate);
router.get('/report/tag/all/:userId/:tags/:dateStart/:dateEnd', authController.authorizeUser, ReportController.getReportsByAllTags);
router.get('/report/tag/any/:userId/:tags/:dateStart/:dateEnd', authController.authorizeUser, ReportController.getReportsByAnyTags);

module.exports = router;
