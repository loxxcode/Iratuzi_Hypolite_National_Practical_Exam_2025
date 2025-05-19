const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');

// @desc    Get all payrolls
// @route   GET /api/payrolls
// @access  Private
exports.getPayrolls = async (req, res) => {
  try {
    // Build query
    let query = Payroll.find();

    // If department filter is provided
    if (req.query.department) {
      // First find employees in the department
      const employees = await Employee.find({ departmentcode: req.query.department });
      const employeeIds = employees.map(emp => emp._id);
      
      // Then find payrolls for those employees
      query = query.where('employee').in(employeeIds);
    }

    // Execute query with population
    const payrolls = await query
      .populate({
        path: 'employee',
        select: 'FirstName LastName employeeNumber departmentcode Position',
      })
      .populate('createdBy', 'username');

    res.status(200).json({
      success: true,
      count: payrolls.length,
      data: payrolls
    });
  } catch (error) {
    console.error('Error in getPayrolls:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single payroll
// @route   GET /api/payrolls/:id
// @access  Private
exports.getPayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id)
      .populate({
        path: 'employee',
        select: 'firstName lastName employeeId department position salary bankInfo',
        populate: {
          path: 'department',
          select: 'name'
        }
      })
      .populate('createdBy', 'username');

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll not found'
      });
    }

    res.status(200).json({
      success: true,
      data: payroll
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new payroll
// @route   POST /api/payrolls
// @access  Private
exports.createPayroll = async (req, res) => {
  try {
    // Add current user as the creator
    req.body.createdBy = req.user.id;
    
    // Check if employee exists
    const employee = await Employee.findById(req.body.employee);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    // Check if payroll already exists for the employee for the same month and year
    const payrollExists = await Payroll.findOne({
      employee: req.body.employee,
      month: req.body.month,
      year: req.body.year
    });
    
    if (payrollExists) {
      return res.status(400).json({
        success: false,
        message: 'Payroll already exists for this employee for the specified month and year'
      });
    }
    
    // Set basic salary from employee record if not provided
    if (!req.body.basicSalary) {
      req.body.basicSalary = employee.salary.basic;
    }
    
    // Create payroll
    const payroll = await Payroll.create(req.body);
    
    res.status(201).json({
      success: true,
      data: payroll
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update payroll
// @route   PUT /api/payrolls/:id
// @access  Private
exports.updatePayroll = async (req, res) => {
  try {
    let payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll not found'
      });
    }
    
    // Only update if status is not 'paid'
    if (payroll.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update a payroll that has already been paid'
      });
    }

    // Update payroll
    payroll = await Payroll.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate({
      path: 'employee',
      select: 'firstName lastName employeeId department position',
      populate: {
        path: 'department',
        select: 'name'
      }
    });

    res.status(200).json({
      success: true,
      data: payroll
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete payroll
// @route   DELETE /api/payrolls/:id
// @access  Private
exports.deletePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll not found'
      });
    }
    
    // Only delete if status is not 'paid'
    if (payroll.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a payroll that has already been paid'
      });
    }

    await payroll.deleteOne();

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

// @desc    Get payrolls for a specific employee
// @route   GET /api/employees/:employeeId/payrolls
// @access  Private
exports.getEmployeePayrolls = async (req, res) => {
  try {
    const payrolls = await Payroll.find({ employee: req.params.employeeId })
      .populate({
        path: 'employee',
        select: 'firstName lastName employeeId department position',
        populate: {
          path: 'department',
          select: 'name'
        }
      })
      .populate('createdBy', 'username');

    res.status(200).json({
      success: true,
      count: payrolls.length,
      data: payrolls
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
