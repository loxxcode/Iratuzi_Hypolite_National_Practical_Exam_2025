const express = require('express');
const router = express.Router();
const { 
  getEmployees, 
  getEmployee, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee,
  getEmployeesByPosition
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');

// Route to get employees by position
router.route('/position/:position')
  .get(protect, getEmployeesByPosition);

// Main employee routes
router.route('/')
  .get(protect, getEmployees)
  .post(protect, authorize('admin', 'hr'), createEmployee);

router.route('/:id')
  .get(protect, getEmployee)
  .put(protect, authorize('admin', 'hr'), updateEmployee)
  .delete(protect, authorize('admin'), deleteEmployee);

module.exports = router;
