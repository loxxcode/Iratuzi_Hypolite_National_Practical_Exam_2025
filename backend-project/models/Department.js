const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  DepartementCode: {
    type: String,
    required: [true, 'Department code is required'],
    unique: true,
    trim: true
  },
  DepartmentName: {
    type: String,
    required: [true, 'Department name is required'],
    trim: true
  },
  GrossSalary: {
    type: Number,
    required: [true, 'Gross salary is required']
  },
  TotalDeduction: {
    type: Number,
    required: [true, 'Total deduction is required'],
    default: 0
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

// Update the updatedAt timestamp before saving
departmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Department', departmentSchema);
