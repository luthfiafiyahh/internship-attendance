const express = require('express');
const {
  checkIn,
  checkOut,
  getAttendanceHistory,
  getAttendanceReport,
  exportAttendanceCSV
} = require('../controllers/attendanceController');

const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.post('/check-in', authMiddleware, checkIn);
router.put('/check-out', authMiddleware, checkOut);
router.get('/history', authMiddleware, getAttendanceHistory);
router.get('/report', authMiddleware, adminMiddleware, getAttendanceReport);
router.get('/export-csv', authMiddleware, adminMiddleware, exportAttendanceCSV);

module.exports = router;
