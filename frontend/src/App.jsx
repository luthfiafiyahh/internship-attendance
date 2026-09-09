import { useEffect, useState } from 'react';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notification, setNotification] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user')) || null
  );

  const [participantName, setParticipantName] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');
  const [participantPassword, setParticipantPassword] = useState('');

  const [editingParticipantId, setEditingParticipantId] = useState(null);

  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [searchParticipant, setSearchParticipant] = useState('');
  const [attendanceReport, setAttendanceReport] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const showNotification = (message, type = 'success') => {
  setNotification({
    message,
    type,
  });

  setTimeout(() => {
    setNotification(null);
  }, 3000);
};

  const totalParticipants = participants.length;
const totalAttendanceRecords = attendanceReport.length;

const currentDate = new Date();

const todayAttendanceCount = attendanceReport.filter((attendance) => {
  const attendanceDate = new Date(attendance.date);

  return (
    attendanceDate.getFullYear() === currentDate.getFullYear() &&
    attendanceDate.getMonth() === currentDate.getMonth() &&
    attendanceDate.getDate() === currentDate.getDate()
  );
}).length;

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:3000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showNotification(data.message, 'error');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      showNotification('Login successful', 'success');

      setUser(data.user);
    } catch (error) {
      console.error('Error:', error);
      showNotification('Unable to connect to the server', 'error');
    }
  };

const handleLogout = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    showNotification('Logout successful', 'success');

    setUser(null);
  } catch (error) {
    console.error('Error:', error);
    showNotification('Logout failed', 'error');
  }
};

  const fetchAttendanceHistory = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        'http://localhost:3000/api/attendance/history',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showNotification(data.message, 'error');
        return;
      }

      setAttendanceHistory(data.data);
    } catch (error) {
      console.error('Error:', error);
      showNotification('Failed to fetch attendance history', 'error');
    }
  };

const validateParticipantForm = () => {
  const name = participantName.trim();
  const emailValue = participantEmail.trim();
  const passwordValue = participantPassword;

  if (!name) {
    showNotification('Name is required', 'error');
    return false;
  }

  if (!emailValue) {
    showNotification('Email is required', 'error');
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(emailValue)) {
    showNotification('Please enter a valid email address', 'error');
    return false;
  }

  if (!passwordValue) {
    showNotification('Password is required', 'error');
    return false;
  }

  if (passwordValue.length < 6) {
    showNotification('Password must be at least 6 characters', 'error');
    return false;
  }

  return true;
};

const validateParticipantUpdateForm = () => {
  const name = participantName.trim();
  const emailValue = participantEmail.trim();
  const passwordValue = participantPassword;

  if (!name) {
    showNotification('Name is required', 'error');
    return false;
  }

  if (!emailValue) {
    showNotification('Email is required', 'error');
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(emailValue)) {
    showNotification('Please enter a valid email address', 'error');
    return false;
  }

  if (!passwordValue) {
    showNotification('Password is required', 'error');
    return false;
  }

  if (passwordValue.length < 6) {
    showNotification(
      'Password must be at least 6 characters',
      'error'
    );
    return false;
  }

  return true;
};

const addParticipant = async () => {
  if (!validateParticipantForm()) {
    return;
  }

  try {
    const token = localStorage.getItem('token');

    const response = await fetch(
      'http://localhost:3000/api/users/participants',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: participantName,
          email: participantEmail,
          password: participantPassword,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      showNotification(data.message, 'error');
      return;
    }

showNotification('Participant added successfully', 'success');
    setParticipantName('');
    setParticipantEmail('');
    setParticipantPassword('');

    fetchParticipants();
  } catch (error) {
    console.error('Error:', error);
    showNotification('Failed to add participant', 'error');
  }
};

const editParticipant = async () => {
  if (!validateParticipantUpdateForm()) {
    return;
  }

  try {
    const token = localStorage.getItem('token');

    const response = await fetch(
      `http://localhost:3000/api/users/participants/${editingParticipantId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: participantName,
          email: participantEmail,
          password: participantPassword,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      showNotification(data.message, 'error');
      return;
    }

    showNotification('Participant updated successfully', 'success');

    setParticipantName('');
    setParticipantEmail('');
    setParticipantPassword('');
    setEditingParticipantId(null);

    fetchParticipants();
  } catch (error) {
    console.error('Error:', error);
    showNotification('Failed to update participant', 'error');
  }
};

const deleteParticipant = (participantId) => {
  setDeleteConfirmation(participantId);
};

const confirmDeleteParticipant = async () => {
  const participantId = deleteConfirmation;

  setDeleteConfirmation(null);

  try {
    const token = localStorage.getItem('token');

    const response = await fetch(
      `http://localhost:3000/api/users/participants/${participantId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      showNotification(data.message, 'error');
      return;
    }

    showNotification('Participant deleted successfully', 'success');

    fetchParticipants();
  } catch (error) {
    console.error('Error:', error);
    showNotification('Failed to delete participant', 'error');
  }
};

  const fetchParticipants = async () => {
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(
      'http://localhost:3000/api/users/all',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      showNotification(data.message, 'error');
      return;
    }

    setParticipants(data.data);
  } catch (error) {
    console.error('Error:', error);
    showNotification('Failed to fetch participants', 'error');
  }
};

const filteredParticipants = participants.filter((participant) =>
  participant.name
    .toLowerCase()
    .includes(searchParticipant.toLowerCase())
);

const fetchAttendanceReport = async () => {
  try {
    const token = localStorage.getItem('token');

const response = await fetch(
  `http://localhost:3000/api/attendance/report?start_date=${startDate}&end_date=${endDate}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      showNotification(data.message, 'error');
      return;
    }

    setAttendanceReport(data.data);
  } catch (error) {
    console.error('Error:', error);
    showNotification('Failed to fetch attendance report', 'error');
  }
};

  useEffect(() => {
    if (user && user.role === 'participant') {
      fetchAttendanceHistory();
    }
  }, [user]);

useEffect(() => {
  if (user && user.role === 'admin') {
    fetchParticipants();
    fetchAttendanceReport();
  }
}, [user]);

const Notification = () => {
  if (!notification) {
    return null;
  }

  const notificationIcon = {
    success: '✓',
    error: '!',
    warning: '⚠',
    info: 'i',
  };

  return (
    <div className={`notification notification-${notification.type}`}>
      <div className="notification-icon">
        {notificationIcon[notification.type]}
      </div>

      <div className="notification-content">
        <strong>
          {notification.type === 'success'
            ? 'Success'
            : notification.type === 'error'
            ? 'Error'
            : notification.type === 'warning'
            ? 'Warning'
            : 'Information'}
        </strong>

        <span>{notification.message}</span>
      </div>

      <button
        className="notification-close"
        onClick={() => setNotification(null)}
      >
        ×
      </button>
    </div>
  );
};

  // =========================
  // DASHBOARD ADMIN
  // =========================
if (user && user.role === 'admin') {
  return (
<>
  <Notification />

  {deleteConfirmation && (
    <div className="confirmation-overlay">
      <div className="confirmation-modal">
        <div className="confirmation-icon">
          !
        </div>

        <div className="confirmation-content">
          <h3>Delete Participant</h3>

          <p>
            Are you sure you want to delete this participant?
          </p>

          <span>
            This action cannot be undone.
          </span>
        </div>

        <div className="confirmation-actions">
          <button
            className="confirmation-cancel"
            onClick={() => setDeleteConfirmation(null)}
          >
            Cancel
          </button>

          <button
            className="confirmation-delete"
            onClick={confirmDeleteParticipant}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )}

  <div className="admin-dashboard">

  <div className="dashboard-header">
    <div>
      <h1>Internship Attendance</h1>
      <h2>Admin Dashboard</h2>
    </div>

    <button onClick={handleLogout}>Logout</button>
  </div>

  <div className="admin-user-card">
    <div className="admin-user-avatar">
      A
    </div>

    <div className="admin-user-details">
      <p className="admin-welcome">
        Welcome back, <strong>Admin</strong>!
      </p>

      <div className="admin-user-meta">
        <span>{user.email}</span>
        <span className="meta-divider">•</span>
        <span>Administrator</span>
      </div>
    </div>
  </div>

  <div className="admin-stats">
  <div className="stat-card">
    <div className="stat-card-label">
      Total Participants
    </div>

    <div className="stat-card-value">
      {totalParticipants}
    </div>

    <div className="stat-card-description">
      Registered participants
    </div>
  </div>

  <div className="stat-card">
    <div className="stat-card-label">
      Attendance Records
    </div>

    <div className="stat-card-value">
      {totalAttendanceRecords}
    </div>

    <div className="stat-card-description">
      Attendance records
    </div>
  </div>

  <div className="stat-card">
    <div className="stat-card-label">
      Today's Attendance
    </div>

    <div className="stat-card-value">
      {todayAttendanceCount}
    </div>

    <div className="stat-card-description">
      Attendance recorded today
    </div>
  </div>
</div>

        <hr />

        <h3>Participant Management</h3>
        
        <div className="participant-form">
        <input
          type="text"
          placeholder="Name"
          value={participantName}
          onChange={(event) => setParticipantName(event.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={participantEmail}
          onChange={(event) => setParticipantEmail(event.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={participantPassword}
          onChange={(event) => setParticipantPassword(event.target.value)}
        />

          <button onClick={editingParticipantId ? editParticipant : addParticipant}>
            {editingParticipantId ? 'Update Participant' : 'Add Participant'}
          </button>

          {editingParticipantId && (
          <button
            onClick={() => {
              setParticipantName('');
              setParticipantEmail('');
              setParticipantPassword('');
              setEditingParticipantId(null);
            }}
          >
            Cancel
          </button>
        )}

        </div>

                <div className="participant-search">
          <svg
            className="search-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>

          <input
            type="text"
            placeholder="Search participant..."
            value={searchParticipant}
            onChange={(event) => setSearchParticipant(event.target.value)}
          />
        </div>

          {participants.length === 0 ? (
            <p>No participants found.</p>
          ) : filteredParticipants.length === 0 ? (
            <p>No participants match your search.</p>
          ) : (
            <table>
            <thead>
            <tr>
              <th>No.</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
            </thead>

            <tbody>
            {filteredParticipants.map((participant, index) => (
              <tr key={participant.id}>
                <td>{index + 1}</td>
                <td>{participant.name}</td>
                <td>{participant.email}</td>
                <td>Participant</td>
                <td>
                  <button
                    onClick={() => {
                      setEditingParticipantId(participant.id);
                      setParticipantName(participant.name);
                      setParticipantEmail(participant.email);
                      setParticipantPassword('');
                    }}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteParticipant(participant.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        )}

        <h3>Attendance Report</h3>
        <div className="report-filter">
        <label>From: </label>
        <input
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
        />

        <label> To: </label>
        <input
          type="date"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
        />

        <button onClick={fetchAttendanceReport}>
          Filter
        </button>

        <button onClick={async () => {
          try {
            const token = localStorage.getItem('token');

            const response = await fetch(
              `http://localhost:3000/api/attendance/export-csv?start_date=${startDate}&end_date=${endDate}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (!response.ok) {
              const data = await response.json();
              showNotification(data.message, 'error');
              return;
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = 'attendance-report.csv';
            link.click();

            window.URL.revokeObjectURL(url);
          } catch (error) {
            console.error('Error:', error);
            showNotification('Failed to download the report', 'error');
          }
        }}>
          Export CSV
        </button>
        </div>

        {attendanceReport.length === 0 ? (
          <p>No attendance records found.</p>
        ) : (
          <table>
            <thead>
              <tr>
              <th>No.</th>
              <th>Name</th>
              <th>Email</th>
              <th>Date</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {attendanceReport.map((attendance, index) => (
                <tr key={attendance.id}>
                  <td>{index + 1}</td>
                  <td>{attendance.name}</td>
                  <td>{attendance.email}</td>
                  <td>
                    {new Date(attendance.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td>{attendance.check_in || '-'}</td>
                  <td>{attendance.check_out || '-'}</td>
                  <td>
                    <span
                      className={
                        attendance.status === 'late'
                          ? 'status-badge status-late'
                          : 'status-badge status-on-time'
                      }
                    >
                      {attendance.status === 'late' ? 'Late' : 'On Time'}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
  }

  // =========================
  // PARTICIPANT DASHBOARD
  // =========================
  if (user) {
    return (
          <>
      <Notification />
    <div className="participant-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Internship Attendance</h1>
          <h2>Participant Dashboard</h2>
        </div>

        <button onClick={handleLogout}>Logout</button>
      </div>

      <div className="participant-user-card">
        <div className="participant-user-avatar">
          {user.name.charAt(0).toUpperCase()}
        </div>

        <div className="participant-user-details">
          <p className="participant-welcome">
            Welcome, <strong>{user.name}</strong>!
          </p>

          <div className="participant-user-meta">
            <span>{user.email}</span>
            <span className="meta-divider">•</span>
            <span>Participant</span>
          </div>
        </div>
      </div>

        <hr />

        {(() => {
          const today = new Date();

          const todayAttendance = attendanceHistory.find((attendance) => {
            const attendanceDate = new Date(attendance.date);

            return (
              attendanceDate.getFullYear() === today.getFullYear() &&
              attendanceDate.getMonth() === today.getMonth() &&
              attendanceDate.getDate() === today.getDate()
            );
          });

          return (
            <>
            <div className="attendance-card">
              <div className="attendance-card-header">
                <div>
                  <h3>Today's Attendance</h3>
                  <p>Record your attendance for today.</p>
                </div>

                <span
                  className={`attendance-status ${
                    !todayAttendance
                      ? 'attendance-status-pending'
                      : todayAttendance.check_out
                      ? 'attendance-status-completed'
                      : 'attendance-status-active'
                  }`}
                >
                  {!todayAttendance
                    ? 'Not Checked In'
                    : todayAttendance.check_out
                    ? 'Completed'
                    : 'Checked In'}
                </span>
              </div>

              <div className="attendance-actions">
                <button
                  disabled={!!todayAttendance}
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('token');

                      const response = await fetch(
                        'http://localhost:3000/api/attendance/check-in',
                        {
                          method: 'POST',
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        }
                      );

                      const data = await response.json();

                      if (!response.ok) {
                        showNotification(data.message, 'error');
                        return;
                      }

                      showNotification(data.message, 'success');
                      fetchAttendanceHistory();
                    } catch (error) {
                      console.error('Error:', error);
                      showNotification('Unable to connect to the server', 'error');
                    }
                  }}
                >
                  Check-in
                </button>

                <button
                  className="checkout-button"
                  disabled={!todayAttendance || !!todayAttendance.check_out}
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('token');

                      const response = await fetch(
                        'http://localhost:3000/api/attendance/check-out',
                        {
                          method: 'PUT',
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        }
                      );

                      const data = await response.json();

                      if (!response.ok) {
                        showNotification(data.message, 'error');
                        return;
                      }

                      showNotification(data.message, 'success');
                      fetchAttendanceHistory();
                    } catch (error) {
                      console.error('Error:', error);
                      showNotification('Unable to connect to the server', 'error');
                    }
                  }}
                >
                  Check-out
                </button>
              </div>
            </div>
            </>
          );
        })()}

        <hr />

        <h3>Attendance History</h3>

        {attendanceHistory.length === 0 ? (
         <p>No attendance records found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {attendanceHistory.map((attendance) => (
                <tr key={attendance.id}>
                  <td>
                    {new Date(attendance.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                  </td>
                  <td>{attendance.check_in || '-'}</td>
                  <td>{attendance.check_out || '-'}</td>
                  <td>
                    <span
                      className={
                        attendance.status === 'late'
                          ? 'status-badge status-late'
                          : 'status-badge status-on-time'
                      }
                    >
                      {attendance.status === 'late' ? 'Late' : 'On Time'}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>
      </>
    );
  }

// =========================
// LOGIN
// =========================
return (
  <>
    <Notification />  
  <div className="login-page">
    <div className="login-container">

      <div className="login-brand">
        <div className="login-brand-content">
          <div className="login-logo">
            ✓
          </div>

          <h1>Internship<br />Attendance</h1>

          <p>
            Manage your internship attendance
            <br />
            easily and efficiently.
          </p>

          <div className="login-decoration">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <div className="login-form-section">
        <div className="login-form-wrapper">

          <div className="login-heading">
            <h2>Track Your Attendance 📋</h2>
            <p>Sign in to your participant account</p>
          </div>

          <form onSubmit={handleLogin}>

            <div className="login-input-group">
              <label>Email</label>

            <input
              type="email"
              name="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
            />
            </div>

            <div className="login-input-group">
              <label>Password</label>

            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
            />
            </div>

            <button type="submit">
              Login
            </button>

          </form>

        </div>
      </div>

    </div>
  </div>
  </>
);
}

export default App;