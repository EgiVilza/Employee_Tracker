const mysql = require('mysql')
const inquirer = require('inquirer')
const cTable = require('console.table')

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'ConnectMe',
    database: 'companyTrackerDB'
})

const start = () => {
    //Starter Questions
    inquirer
        .prompt([
        {
            name: 'toDo',
            type: 'list',
            message: 'What would you like to do?',
            choices: [
                'View all employees',
                'View employees by department',
                'View employess by manager',
                'View all roles',
                'Add employee',
                'Remove employee',
                'Add Role',
                'Remove Role',
                'Add department',
                'Remove department',
                'Quit'
            ]
        }
    ])
    .then((answer) => {
        switch (`${answer.toDo}`) {
            case 'View all employees':
                viewAll()
                break;

            case 'View employees by department':
                viewByDepartment()
                break;

            case 'View employess by manager':
                viewByManager()
                break;

            case 'View all roles':
                viewRoles()
                break;

            case 'Add employee':
                addEmployee()
                break;

            case 'Remove employee':
                removeEmployee()
                break;

            case 'Add Role':
                addRole()
                break;    

            case 'Remove Role':
                removeRole()
                break;

            case 'Add department':
                addDepartment()
                break;

            case 'Remove department':
                removeDepartment()
                break;
            
            case 'Quit':
                connection.end()
                break;
        }
    })
}

const viewAll = () => {
    //Query
    connection.query(
        `SELECT 
        e.employee_id, 
        CONCAT(e.first_name, ' ', e.last_name) as fullName, 
        role.title as title,
        role.salary as salary, 
        department.Name as department,
        CONCAT(m.first_name, ' ', m.last_name) as Manager
        From employee e
        JOIN role
        ON e.role_id = role.role_id
        JOIN department
        ON role.department_id = department.department_id
        LEFT JOIN employee m
        ON m.employee_id = e.manager_id;`, (err, res) => {
        if (err) throw err;
        // Log all results of the SELECT statement
        console.table('\n', res, '\n')
        start()
      });
}

const viewByDepartment = () => {
    let listOfDepartments = []
    //Query to grap list of departments
    connection.query(
        'SELECT * FROM department',
        (err, results) => {
            if (err) throw err;
            var departmentsString = JSON.stringify(results)
            var parseDepartments= JSON.parse(departmentsString)
            parseDepartments.forEach(element => {
                listOfDepartments.push(element.Name)
            });
            whichDepartment()
        }
    )
    //Question
    const whichDepartment = () => {
        inquirer
        .prompt([
            {
                name: 'chooseDepartment',
                type: 'list',
                message: 'Choose department',
                choices: listOfDepartments
            }
        ])
        .then((answer) => {
            connection.query(
                `SELECT 
                employee.employee_id, 
                CONCAT(employee.first_name, ' ', employee.last_name) as fullName, 
                role.title as title,
                role.salary as salary, 
                department.Name as department
                From employee
                JOIN role
                ON employee.role_id = role.role_id
                JOIN department
                ON role.department_id = department.department_id
                WHERE department.Name = ?`,
                [answer.chooseDepartment],
                (err, res) => {
                    if (err) throw (err);
                    console.table('\n', res, '\n')
                    start()
                }
            )
        })
    }
    
}

const viewByManager = () => {
    let listOfManagers = ["No Manager"]
    
    connection.query(
        "SELECT CONCAT(first_name, ' ', last_name) AS fullName, employee_id FROM employee WHERE role_id = 3",
        (err, results) => {
            if (err) throw err;
            var parseManagers = JSON.parse(JSON.stringify(results))
            parseManagers.forEach(element => {
                listOfManagers.push(element.fullName)
            });
            whichManager()
        }
    )

    const whichManager = () => {
        inquirer
        .prompt([
            {
                name: 'chooseManager',
                type: 'list',
                message: 'Choose Manager',
                choices: listOfManagers
            }
        ])
        .then((answer) => {
            let manager = answer.chooseManager
            let whereClause = `WHERE CONCAT(m.first_name, ' ', m.last_name) = ?`
            if (manager == "No Manager") {
                whereClause = `WHERE CONCAT(m.first_name, ' ', m.last_name) is null`
            }
            connection.query(
                `SELECT 
                e.employee_id, 
                CONCAT(e.first_name, ' ', e.last_name) as fullName, 
                role.title as title,
                role.salary as salary, 
                department.Name as department,
                CONCAT(m.first_name, ' ', m.last_name) as Manager
                From employee e
                JOIN role
                ON e.role_id = role.role_id
                JOIN department
                ON role.department_id = department.department_id
                LEFT JOIN employee m
                ON m.employee_id = e.manager_id
                ${whereClause}`,
                [manager],
                (err, res) => {
                    if (err) throw (err);
                    console.table('\n', res, '\n')
                    start()
                }
            )
        })
    }
}

const viewRoles = () => {
    connection.query(
        "SELECT * FROM role",
        (err, res) => {
            if (err) throw (err);
            console.table('\n', res, '\n')
            start()
        }
    )
}

const addEmployee = () => {
    //Store a list of roles into a variable from querying the database
    let listOfRoles = []
    connection.query(
        'SELECT * FROM role',
        (err, results) => {
            if (err) throw err;
            var parseRoles = JSON.parse(JSON.stringify(results))
            parseRoles.forEach(element => {
                listOfRoles.push(element.title)
            });
        }
    )

    let listOfManagers = ["No Manager"]
    connection.query(
        "SELECT CONCAT(first_name, ' ', last_name) AS fullName FROM employee WHERE role_id = 3",
        (err, results) => {
            if (err) throw err;
            var parseManagers = JSON.parse(JSON.stringify(results))
            parseManagers.forEach(element => {
                listOfManagers.push(element.fullName)
            });
        }
    )

    inquirer
        .prompt([
            {
                name: 'firstName',
                type: 'input',
                message: 'What is the first name of the employee?'
            },
            {
                name: 'lastName',
                type: 'input',
                message: 'What is the last name of the employee?'
            },
            {
                name: 'role',
                type: 'list',
                message: 'What is the role of the employee',
                choices: listOfRoles
            },
            {
                name: 'managerName',
                type: 'list',
                message: "Who is the employee's manager?",
                choices: listOfManagers
            }
        ])
        .then((answer) => {
            //Stores manager id for role into a variable
            let managerId = [];

            //Stores role id for role into a variable
            let roleId = [];

            //Query to get department id
            if (answer.managerName != "No Manager") {
                var spliting = answer.managerName.split(' ')
                var managerFirstName = spliting[0]
                connection.query(
                    'SELECT employee_id FROM employee WHERE ?',
                    {
                        first_name: managerFirstName
                    },
                    (err, results) => {
                        if (err) throw err;
                        var managerParsed = JSON.parse(JSON.stringify(results))
                        managerId.push(managerParsed[0].employee_id)
                    }
                )
            }   
            
            connection.query(
                'SELECT role_id FROM role WHERE ?',
                {
                    title: answer.role
                },
                (err, results) => {
                    if (err) throw err;
                    var roleParsed = JSON.parse(JSON.stringify(results))
                    roleId.push(roleParsed[0].role_id)
                    insert()
                }
            )

            const insert = () => {
                connection.query(
                    'INSERT INTO employee SET ?',
                    {
                        first_name: answer.firstName,
                        last_name: answer.lastName,
                        role_id: roleId[0],
                        manager_id: managerId[0]
                    },
                    (err, res) => {
                        if (err) throw err;
                        console.log("Employee Successfully Added")
                        start()
                    }
                )
            }

        })
}

const removeEmployee = () => {
    //
    let listOfEmployees = []

    connection.query(
        "SELECT first_name, employee_id FROM employee",
        (err, results) => {
            if (err) throw err;
            var parseEmployees = JSON.parse(JSON.stringify(results))
            parseEmployees.forEach(element => {
                listOfEmployees.push(element.first_name)
            });
            chooseEmp()
        }
    )

    const chooseEmp = () => {
        inquirer
        .prompt([
            {
                name: 'chooseEmployee',
                type: 'list',
                message: 'Delete which employee?',
                choices: listOfEmployees
            },
        ])
        .then((answer) => {
            connection.query(
                `DELETE from employee where first_name = "${answer.chooseEmployee}";`,
                (err, results) => {
                    if (err) throw err;
                    console.log("Employee Removed")
                    start()
                }
            )
        })
    }
    
}

const addRole = () => {
    //Store a list of departments into a variable from querying the database
    let listOfDepartments = []
    connection.query(
        'SELECT * FROM department',
        (err, results) => {
            if (err) throw err;
            var departmentsString = JSON.stringify(results)
            var parseDepartments= JSON.parse(departmentsString)
            parseDepartments.forEach(element => {
                listOfDepartments.push(element.Name)
            });
        }
    )

    inquirer
        .prompt([
            {
                name: 'title',
                type: 'input',
                message: 'What is the title of the role?'
            },
            {
                name: 'salary',
                type: 'input',
                message: 'What is the salary for this role? (ex: 50000.00)'
            },
            {
                name: 'department',
                type: 'list',
                message: 'Which department is this role in?',
                choices: listOfDepartments
            }
        ])
        .then((answer) => {
 
            //Stores department id for role into a variable
            let departmentId = [];
            //Query to get department id
            connection.query(
                'SELECT department_id FROM department WHERE ?',
                {
                    Name: answer.department
                },
                (err, results) => {
                    if (err) throw err;
                    var departmentParsed = JSON.parse(JSON.stringify(results))
                    departmentId.push(departmentParsed[0].department_id)
                    insert()
                }
            )

            const insert = () => {
                connection.query(
                    'INSERT INTO role SET ?',
                    {
                        title: answer.title,
                        salary: parseFloat(answer.salary),
                        department_id: departmentId[0]
                    },
                    (err, res) => {
                        if (err) throw err;
                        console.log("Role Successfully Added")
                        start()
                    }
                )
            }
            
        })
}

const removeRole = () => {

    let listOfRoles = []
    connection.query(
        'SELECT * FROM role',
        (err, results) => {
            if (err) throw err;
            var parseRoles = JSON.parse(JSON.stringify(results))
            parseRoles.forEach(element => {
                listOfRoles.push(element.title)
            });
            chooseRole()
        }
    )

    const chooseRole = () => {
        inquirer
        .prompt([
            {
                name: 'chooseRole',
                type: 'list',
                message: 'Delete which role?',
                choices: listOfRoles
            },
        ])
        .then((answer) => {
            connection.query(
                `DELETE from role where title = "${answer.chooseRole}";`,
                (err, results) => {
                    if (err) throw err;
                    console.log("Role Removed")
                    start()
                }
            )
        })
    }
}

const addDepartment = () => {
    inquirer
        .prompt([
            {
                name: 'department',
                type: 'input',
                message: 'What is the department name?'
            }
        ])
        .then((answer) => {
            connection.query(
                'INSERT INTO department SET ?',
                {
                    Name: answer.department
                },
                (err) => {
                    if (err) throw err;
                    console.log("Department Successfully Added")
                    start()
                }
            )
        })
}

const removeDepartment = () => {
    let listOfDepartments = []
    connection.query(
        'SELECT * FROM department',
        (err, results) => {
            if (err) throw err;
            var parseDepartments = JSON.parse(JSON.stringify(results))
            parseDepartments.forEach(element => {
                listOfDepartments.push(element.Name)
            });
            chooseDepartment()
        }
    )

    const chooseDepartment = () => {
        inquirer
        .prompt([
            {
                name: 'chooseDepartment',
                type: 'list',
                message: 'Delete which role?',
                choices: listOfDepartments
            },
        ])
        .then((answer) => {
            connection.query(
                `DELETE from department where Name = "${answer.chooseDepartment}";`,
                (err, results) => {
                    if (err) throw err;
                    console.log("\nDepartment Removed\n")
                    start()
                }
            )
        })
    }
}

connection.connect((err) => {
    if (err) throw err;
    start();
})



