CREATE DATABASE `companyTrackerDB`;
use companyTrackerDB;

CREATE TABLE department (
    department_id INT(6) AUTO_INCREMENT PRIMARY KEY NOT NULL,
    Name VARCHAR(30) NOT NULL
);

CREATE TABLE role (
    role_id INT(6) AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL(10,2) NOT NULL,
    department_id INT(6) NOT NULL,
    FOREIGN KEY (department_id) REFERENCES department(department_id)
);

CREATE TABLE employee (
    employee_id INT(6) AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT(6) NOT NULL,
    manager_id INT(6),
    FOREIGN KEY (role_id) REFERENCES role(role_id),
    FOREIGN KEY (manager_id) REFERENCES employee(employee_id)
);