-- Create sample tables for interview questions
CREATE TABLE employees (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100),
    department VARCHAR(50),
    salary INTEGER,
    hire_date DATE,
    manager_id INTEGER
);

CREATE TABLE departments (
    id INTEGER PRIMARY KEY,
    name VARCHAR(50),
    budget INTEGER
);

CREATE TABLE projects (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100),
    department_id INTEGER,
    start_date DATE,
    end_date DATE
);

-- Insert sample data
INSERT INTO departments VALUES 
(1, 'Engineering', 1000000),
(2, 'Marketing', 500000),
(3, 'Sales', 750000);

INSERT INTO employees VALUES 
(1, 'Alice Johnson', 'Engineering', 95000, '2022-01-15', NULL),
(2, 'Bob Smith', 'Engineering', 85000, '2022-03-01', 1),
(3, 'Carol Davis', 'Marketing', 70000, '2021-11-20', NULL),
(4, 'David Wilson', 'Sales', 65000, '2023-02-10', NULL),
(5, 'Eve Brown', 'Engineering', 90000, '2022-07-05', 1);

INSERT INTO projects VALUES 
(1, 'Mobile App Redesign', 1, '2024-01-01', '2024-06-30'),
(2, 'Marketing Campaign Q2', 2, '2024-04-01', '2024-06-30'),
(3, 'Sales Analytics Dashboard', 3, '2024-02-15', '2024-05-15');
