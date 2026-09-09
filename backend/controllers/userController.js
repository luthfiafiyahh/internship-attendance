const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `;

    db.query(
      sql,
      [name, email, hashedPassword, role || 'participant'],
      (err, result) => {
        if (err) {
          console.error('Failed to create user:', err.message);
          return res.status(500).json({
            message: 'Failed to create user'
          });
        }

        res.status(201).json({
          message: 'User created successfully',
          userId: result.insertId
        });
      }
    );
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({
      message: 'An error occurred on the server'
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const sql = 'SELECT * FROM users WHERE email = ?';

    db.query(sql, [email], async (err, results) => {
      if (err) {
        console.error('Failed to find user:', err.message);
        return res.status(500).json({
          message: 'Login failed'
        });
      }

      if (results.length === 0) {
        return res.status(401).json({
          message: 'Invalid email or password'
        });
      }

      const user = results[0];

      const isPasswordValid = await bcrypt.compare(
        password,
        user.password
      );

      if (!isPasswordValid) {
        return res.status(401).json({
          message: 'Invalid email or password'
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
          role: user.role
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '1d'
        }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({
      message: 'Server error'
    });
  }
};

const getAllUsers = (req, res) => {
  const sql = `
    SELECT id, name, email, role, created_at
    FROM users
    WHERE role = 'participant'
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Failed to fetch user data:', err.message);
      return res.status(500).json({
        message: 'Failed to fetch user data'
      });
    }

    res.json({
      message: 'User data fetched successfully',
      data: results
    });
  });
};

const createParticipant = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      message: 'Name is required'
    });
  }

  if (!email || !email.trim()) {
    return res.status(400).json({
      message: 'Email is required'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({
      message: 'Please enter a valid email address'
    });
  }

  if (!password) {
    return res.status(400).json({
      message: 'Password is required'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: 'Password must be at least 6 characters'
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, 'participant')
    `;

    db.query(
      sql,
      [name, email, hashedPassword],
      (err, result) => {
        if (err) {
          console.error('Failed to create participant:', err.message);

          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
              message: 'Email is already registered'
            });
          }

          return res.status(500).json({
            message: 'Failed to create participant'
          });
        }

        res.status(201).json({
          message: 'Participant created successfully',
          participantId: result.insertId
        });
      }
    );
  } catch (error) {
    console.error('Error:', error.message);

    res.status(500).json({
      message: 'Server error'
    });
  }
};

const updateParticipant = async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      message: 'Name is required'
    });
  }

  if (!email || !email.trim()) {
    return res.status(400).json({
      message: 'Email is required'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({
      message: 'Please enter a valid email address'
    });
  }

  if (!password) {
    return res.status(400).json({
      message: 'Password is required'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: 'Password must be at least 6 characters'
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      UPDATE users
      SET name = ?, email = ?, password = ?
      WHERE id = ? AND role = 'participant'
    `;

    const params = [
      name.trim(),
      email.trim(),
      hashedPassword,
      id
    ];

    db.query(sql, params, (err, result) => {
      if (err) {
        console.error('Failed to update participant:', err.message);

        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({
            message: 'Email is already registered'
          });
        }

        return res.status(500).json({
          message: 'Failed to update participant'
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: 'Participant not found'
        });
      }

      res.json({
        message: 'Participant updated successfully'
      });
    });
  } catch (error) {
    console.error('Error:', error.message);

    res.status(500).json({
      message: 'Server error'
    });
  }
};

const deleteParticipant = (req, res) => {
  const { id } = req.params;

  const deleteAttendanceSql = `
    DELETE FROM attendance
    WHERE user_id = ?
  `;

  db.query(deleteAttendanceSql, [id], (attendanceErr) => {
    if (attendanceErr) {
      console.error(
        'Failed to delete participant attendance:',
        attendanceErr.message
      );

      return res.status(500).json({
        message: 'Failed to delete participant attendance'
      });
    }

    const deleteUserSql = `
      DELETE FROM users
      WHERE id = ? AND role = 'participant'
    `;

    db.query(deleteUserSql, [id], (userErr, result) => {
      if (userErr) {
        console.error(
          'Failed to delete participant:',
          userErr.message
        );

        return res.status(500).json({
          message: 'Failed to delete participant'
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: 'Participant not found'
        });
      }

      res.json({
        message: 'Participant deleted successfully'
      });
    });
  });
};

module.exports = {
  register,
  login,
  getAllUsers,
  createParticipant,
  updateParticipant,
  deleteParticipant
};