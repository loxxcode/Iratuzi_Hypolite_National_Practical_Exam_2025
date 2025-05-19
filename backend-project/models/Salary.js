const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  GrossSalary: {
    type: Number,
    required: [true, 'Gross salary is required']
  },
  TotalDeducation: {
    type: Number,
    required: [true, 'Total deduction is required']
  },
  NetSalary: {
    type: Number,
    required: [true, 'Net salary is required']
  },
  month: {
    type: String,
    required: [true, 'Month is required']
  },
  employeeNumber: {
    type: String,
    ref: 'Employee',
    required: [true, 'Employee number is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate net salary before saving
salarySchema.pre('save', function(next) {
  // Update timestamp
  this.updatedAt = Date.now();
  
  // Calculate net salary
  this.NetSalary = this.GrossSalary - this.TotalDeducation;
  
  next();
});

module.exports = mongoose.model('Salary', salarySchema);
