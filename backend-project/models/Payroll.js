const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee is required']
  },
  month: {
    type: Number,
    required: [true, 'Month is required'],
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: [true, 'Year is required']
  },
  basicSalary: {
    type: Number,
    required: [true, 'Basic salary is required']
  },
  allowances: {
    overtime: {
      type: Number,
      default: 0
    },
    medical: {
      type: Number,
      default: 0
    },
    transportation: {
      type: Number,
      default: 0
    },
    other: {
      type: Number,
      default: 0
    }
  },
  deductions: {
    tax: {
      type: Number,
      default: 0
    },
    insurance: {
      type: Number,
      default: 0
    },
    loan: {
      type: Number,
      default: 0
    },
    other: {
      type: Number,
      default: 0
    }
  },
  netSalary: {
    type: Number,
    required: [true, 'Net salary is required']
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'paid'],
    default: 'pending'
  },
  paymentDate: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ['bank transfer', 'cash', 'check'],
    default: 'bank transfer'
  },
  comments: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Calculate net salary before saving
payrollSchema.pre('save', function(next) {
  // Update timestamp
  this.updatedAt = Date.now();
  
  // Calculate total allowances
  const totalAllowances = 
    (this.allowances.overtime || 0) + 
    (this.allowances.medical || 0) + 
    (this.allowances.transportation || 0) + 
    (this.allowances.other || 0);
  
  // Calculate total deductions
  const totalDeductions = 
    (this.deductions.tax || 0) + 
    (this.deductions.insurance || 0) + 
    (this.deductions.loan || 0) + 
    (this.deductions.other || 0);
  
  // Calculate net salary
  this.netSalary = this.basicSalary + totalAllowances - totalDeductions;
  
  next();
});

module.exports = mongoose.model('Payroll', payrollSchema);
