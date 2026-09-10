const db = require('../db');

const checkIn = (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT * FROM attendance
    WHERE user_id = ? AND date = CURDATE()
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Failed to check attendance:', err.message);
      return res.status(500).json({
        message: 'Failed to check attendance'
      });
    }

    if (results.length > 0) {
      return res.status(400).json({
        message: 'You have already checked in today'
      });
    }

    const checkInTime = new Date();

    const jakartaTime = new Date(
  checkInTime.toLocaleString('en-US', {
    timeZone: 'Asia/Jakarta'
  })
);

const hours = jakartaTime.getHours();
const minutes = jakartaTime.getMinutes();

    const status =
      hours > 8 || (hours === 8 && minutes > 0)
        ? 'late'
        : 'present';

    const insertSql = `
      INSERT INTO attendance (user_id, date, check_in, status)
      VALUES (?, CURDATE(), CURTIME(), ?)
    `;

    db.query(
      insertSql,
      [userId, status],
      (err, result) => {
        if (err) {
          console.error('Failed to check in:', err.message);
          return res.status(500).json({
            message: 'Failed to check in'
          });
        }

        res.status(201).json({
          message: 'Check-in successful',
          attendanceId: result.insertId,
          status
        });
      }
    );
  });
};

const checkOut = (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT * FROM attendance
    WHERE user_id = ? AND date = CURDATE()
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Failed to check attendance:', err.message);
      return res.status(500).json({
        message: 'Failed to check attendance'
      });
    }

    if (results.length === 0) {
      return res.status(400).json({
        message: 'You have not checked in today'
      });
    }

    if (results[0].check_out) {
      return res.status(400).json({
        message: 'You have already checked out today'
      });
    }

    const updateSql = `
      UPDATE attendance
      SET check_out = CURTIME()
      WHERE user_id = ? AND date = CURDATE()
    `;

    db.query(updateSql, [userId], (err) => {
      if (err) {
        console.error('Failed to check out:', err.message);
        return res.status(500).json({
          message: 'Failed to check out'
        });
      }

      res.json({
        message: 'Check-out successful'
      });
    });
  });
};

const getAttendanceHistory = (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT id, date, check_in, check_out, status
    FROM attendance
    WHERE user_id = ?
    ORDER BY date DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Failed to fetch attendance history:', err.message);
      return res.status(500).json({
        message: 'Failed to fetch attendance history'
      });
    }

    res.json({
      message: 'Attendance history fetched successfully',
      data: results
    });
  });
};

const getAttendanceReport = (req, res) => {
  const { start_date, end_date } = req.query;

  let sql = `
    SELECT
      attendance.id,
      users.name,
      users.email,
      attendance.date,
      attendance.check_in,
      attendance.check_out,
      attendance.status
    FROM attendance
    JOIN users ON attendance.user_id = users.id
  `;

  const params = [];

  if (start_date && end_date) {
    sql += `
      WHERE attendance.date BETWEEN ? AND ?
    `;
    params.push(start_date, end_date);
  }

  sql += `
    ORDER BY attendance.date DESC, attendance.check_in DESC
  `;

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Failed to fetch attendance report:', err.message);
      return res.status(500).json({
        message: 'Failed to fetch attendance report'
      });
    }

    res.json({
      message: 'Attendance report fetched successfully',
      data: results
    });
  });
};

const exportAttendanceCSV = (req, res) => {
  const { start_date, end_date } = req.query;

  let sql = `
    SELECT
      users.name,
      users.email,
      attendance.date,
      attendance.check_in,
      attendance.check_out,
      attendance.status
    FROM attendance
    JOIN users ON attendance.user_id = users.id
  `;

  const params = [];

  if (start_date && end_date) {
    sql += `
      WHERE attendance.date BETWEEN ? AND ?
    `;
    params.push(start_date, end_date);
  }

  sql += `
    ORDER BY attendance.date DESC, attendance.check_in DESC
  `;

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Failed to export attendance report:', err.message);
      return res.status(500).json({
        message: 'Failed to export attendance report'
      });
    }

let csv = 'No.,Name,Email,Date,Check-in,Check-out,Status\n';

results.forEach((row, index) => {
  const date = new Date(row.date);

  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Jakarta'
  });

  const status = row.status === 'late' ? 'Late' : 'On Time';

  csv += `${index + 1},"${row.name}","${row.email}","${formattedDate}","${row.check_in || '-'}","${row.check_out || '-'}","${status}"\n`;
});

    res.header('Content-Type', 'text/csv');
    res.attachment('attendance-report.csv');
    res.send(csv);
  });
};

module.exports = {
  checkIn,
  checkOut,
  getAttendanceHistory,
  getAttendanceReport,
  exportAttendanceCSV
};
