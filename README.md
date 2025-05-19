# Employee Payroll Management System

This project consists of a full-stack Employee Payroll Management System with a React frontend and a Node.js/Express backend connected to MongoDB.

## Project Structure

The project is divided into two main folders:
- `frontend-project`: React-based user interface
- `backend-project`: Node.js/Express API with MongoDB integration

## Backend Features

The backend implements the following functionality:

- **Authentication**: User registration, login, and authentication using JWT
- **Employee Management**: CRUD operations for employees
- **Department Management**: CRUD operations for departments
- **Salary Management**: CRUD operations for employee salaries

### Database Models

1. **Employee**:
   - employeeNumber (unique identifier)
   - FirstName, LastName
   - Position
   - Address
   - Telephone
   - Gender
   - hiredDate

2. **Department**:
   - DepartementCode (unique identifier)
   - DepartmentName
   - GrossSalary
   - Employee_Number (Foreign Key to Employee)

3. **Salary**:
   - GrossSalary
   - TotalDeducation
   - NetSalary
   - month
   - Employee_Number (Foreign Key to Employee)

## Frontend Features

The frontend implements:

- **User Authentication**: Login and registration interfaces
- **Dashboard**: Overview of system statistics
- **Employee Management**: List, add, edit, and view employees
- **Department Management**: List, add, edit, and view departments
- **Salary Management**: List, add, and view salary records

### UI Components

The frontend uses React Bootstrap for a responsive and modern UI with:
- Navigation sidebar
- Dashboard cards
- Data tables
- Forms with validation
- Toast notifications

## Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend-project
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/payroll-management
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=7d
   ```

4. Start the server:
   ```
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend-project
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get single employee
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Departments
- `GET /api/departments` - Get all departments
- `GET /api/departments/:id` - Get single department
- `POST /api/departments` - Create department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

### Salaries
- `GET /api/salaries` - Get all salaries
- `GET /api/salaries/:id` - Get single salary
- `POST /api/salaries` - Create salary
- `PUT /api/salaries/:id` - Update salary
- `DELETE /api/salaries/:id` - Delete salary
- `GET /api/salaries/employee/:employeeNumber` - Get employee's salaries
