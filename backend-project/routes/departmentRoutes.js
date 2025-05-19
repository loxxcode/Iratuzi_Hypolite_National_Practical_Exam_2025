const express = require('express');
const router = express.Router();
const { 
  getDepartments, 
  getDepartment, 
  createDepartment, 
  updateDepartment, 
  deleteDepartment,
  getDepartmentByCode
} = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/auth');

// Routes
router.route('/')
  .get(protect, getDepartments)
  .post(protect, authorize('admin'), createDepartment);

router.route('/:id')
  .get(protect, getDepartment)
  .put(protect, authorize('admin'), updateDepartment)
  .delete(protect, authorize('admin'), deleteDepartment);

router.route('/code/:code')
  .get(protect, getDepartmentByCode);

module.exports = router;
