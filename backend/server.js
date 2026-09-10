const express = require('express');
const cors = require('cors');
const db = require('./db');
const userRoutes = require('./routes/userRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Internship Attendance API is running'
  });
});

app.listen(PORT, () => {
  console.log('Timezone Node.js:', Intl.DateTimeFormat().resolvedOptions().timeZone);
  console.log(`Server berjalan di port ${PORT}`);
});
