const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Import routes
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const salaryRoutes = require('./routes/salaryRoutes');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// MongoDB Connection - Explicitly using localhost without env variable to ensure connection
mongoose.connect('mongodb://localhost:27017/EPMS', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB Connected to EPMS Database');
  console.log('Database URL: mongodb://localhost:27017/EPMS');
})
.catch(err => {
  console.error('MongoDB Connection Error: ', err);
  // Exit the application if database connection fails
  process.exit(1);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/payrolls', payrollRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/salaries', salaryRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Payroll Management System API is running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
