const express = require('express');
const router = express.Router();
const { 
  getSalaries, 
  getSalary, 
  createSalary, 
  updateSalary, 
  deleteSalary,
  getEmployeeSalaries
} = require('../controllers/salaryController');
const { protect, authorize } = require('../middleware/auth');

// Routes for salaries
router.route('/')
  .get(protect, getSalaries)
  .post(protect, authorize('admin', 'hr', 'accountant'), createSalary);

router.route('/:id')
  .get(protect, getSalary)
  .put(protect, authorize('admin', 'hr', 'accountant'), updateSalary)
  .delete(protect, authorize('admin'), deleteSalary);

// Routes for employee salaries
router.route('/employee/:employeeNumber')
  .get(protect, getEmployeeSalaries);

module.exports = router;
