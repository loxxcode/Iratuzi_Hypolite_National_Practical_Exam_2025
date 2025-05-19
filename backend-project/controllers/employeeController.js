const Employee = require('../models/Employee');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find();

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
exports.getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private
exports.createEmployee = async (req, res) => {
  try {
    // Check if employee number already exists
    const existingEmployee = await Employee.findOne({ employeeNumber: req.body.employeeNumber });
    
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: `Employee number ${req.body.employeeNumber} already exists. Please use a different employee number.`
      });
    }

    // Create employee
    const employee = await Employee.create(req.body);

    res.status(201).json({
      success: true,
      data: employee
    });
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Employee number already exists. Please use a different employee number.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private
exports.updateEmployee = async (req, res) => {
  try {
    let employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Update employee
    employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    await employee.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get employees by position
// @route   GET /api/employees/position/:position
// @access  Private
exports.getEmployeesByPosition = async (req, res) => {
  try {
    const employees = await Employee.find({ Position: req.params.position });

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
