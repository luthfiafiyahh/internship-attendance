const express = require('express');
const {
  register,
  login,
  getAllUsers,
  createParticipant,
  updateParticipant,
  deleteParticipant
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'User API is running'
  });
});

router.post('/register', register);
router.post('/login', login);

router.get('/profile', authMiddleware, (req, res) => {
  res.json({
    message: 'Akses berhasil',
    user: req.user
  });
});

router.get('/all', authMiddleware, adminMiddleware, getAllUsers);
router.post(
  '/participants',
  authMiddleware,
  adminMiddleware,
  createParticipant
);

router.put(
  '/participants/:id',
  authMiddleware,
  adminMiddleware,
  updateParticipant
);

router.delete(
  '/participants/:id',
  authMiddleware,
  adminMiddleware,
  deleteParticipant
);

module.exports = router;
