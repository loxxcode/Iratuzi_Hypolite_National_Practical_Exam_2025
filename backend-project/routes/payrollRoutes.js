const express = require('express');
const router = express.Router({ mergeParams: true });
const { 
  getPayrolls, 
  getPayroll, 
  createPayroll, 
  updatePayroll, 
  deletePayroll,
  getEmployeePayrolls
} = require('../controllers/payrollController');
const { protect, authorize } = require('../middleware/auth');

// Routes
router.route('/')
  .get(protect, getPayrolls)
  .post(protect, authorize('admin', 'hr', 'accountant'), createPayroll);

router.route('/:id')
  .get(protect, getPayroll)
  .put(protect, authorize('admin', 'hr', 'accountant'), updatePayroll)
  .delete(protect, authorize('admin'), deletePayroll);

module.exports = router;
