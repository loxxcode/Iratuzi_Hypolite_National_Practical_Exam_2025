const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeNumber: {
    type: String,
    required: [true, 'Employee number is required'],
    unique: true,
    trim: true
  },
  FirstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  LastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  Position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true
  },
  Address: {
    type: String,
    trim: true
  },
  Telephone: {
    type: String,
    trim: true
  },
  Gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  hiredDate: {
    type: Date,
    default: Date.now
  },
  departmentcode: {
    type: String,
    ref: 'Department',
    required: [true, 'Department code is required']
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
employeeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Employee', employeeSchema);
