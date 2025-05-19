const Salary = require('../models/Salary');
const Employee = require('../models/Employee');

// @desc    Get all salaries
// @route   GET /api/salaries
// @access  Private
exports.getSalaries = async (req, res) => {
  try {
    const salaries = await Salary.find();

    res.status(200).json({
      success: true,
      count: salaries.length,
      data: salaries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single salary
// @route   GET /api/salaries/:id
// @access  Private
exports.getSalary = async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id);

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: 'Salary record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: salary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new salary
// @route   POST /api/salaries
// @access  Private
exports.createSalary = async (req, res) => {
  try {
    // Check if employee exists
    const employee = await Employee.findOne({ employeeNumber: req.body.employeeNumber });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    // Check if salary already exists for this employee for the same month
    const existingSalary = await Salary.findOne({
      employeeNumber: req.body.employeeNumber,
      month: req.body.month
    });
    
    if (existingSalary) {
      return res.status(400).json({
        success: false,
        message: 'Salary record already exists for this employee for the specified month'
      });
    }
    
    // Create salary
    const salary = await Salary.create(req.body);
    
    res.status(201).json({
      success: true,
      data: salary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update salary
// @route   PUT /api/salaries/:id
// @access  Private
exports.updateSalary = async (req, res) => {
  try {
    let salary = await Salary.findById(req.params.id);

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: 'Salary record not found'
      });
    }

    // Update salary
    salary = await Salary.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: salary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete salary
// @route   DELETE /api/salaries/:id
// @access  Private
exports.deleteSalary = async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id);

    if (!salary) {
      return res.status(404).json({
        success: false,
        message: 'Salary record not found'
      });
    }

    await salary.deleteOne();

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

// @desc    Get salary for a specific employee
// @route   GET /api/employees/:employeeNumber/salary
// @access  Private
exports.getEmployeeSalaries = async (req, res) => {
  try {
    const salaries = await Salary.find({ employeeNumber: req.params.employeeNumber });

    res.status(200).json({
      success: true,
      count: salaries.length,
      data: salaries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
