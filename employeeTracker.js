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

//Initiates the application
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

//View all employee information (name, manager, id, department, role)
const viewAll = () => {
    //Query to view all of the employee information
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

//View employee information by department
const viewByDepartment = () => {
    //list of department array
    let listOfDepartments = []
    //Query to grap list of departments and stores them in the listOfDepartments array
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
    //Inquirer to selec which department to view employees from
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
            //Query for employee info by department
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

//View employee information by Manager
const viewByManager = () => {
    //Query to grab a list of managers and stores them in the listOfManagers array
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

    //Inquirer to select which manager to view the list of employee info
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
            //Change where clause if a valid manager or "No Manager" was chosen
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

//View all roles
const viewRoles = () => {
    //Query to view all roles in the role table
    connection.query(
        "SELECT * FROM role",
        (err, res) => {
            if (err) throw (err);
            console.table('\n', res, '\n')
            start()
        }
    )
}

//Add employee to employee table
const addEmployee = () => {
    //Store a list of roles into a array from the query below
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

    //Stores a list of Managers into a variable from the query below
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

    //Inquirer for info to add employee
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

            //Query to get manager_id and store it in the managerId variable
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
            
            //Query to grab the role_id and stor it in the roldId variable
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
                        console.log("\nEmployee Successfully Added\n")
                        start()
                    }
                )
            }

        })
}

//Remove employee from employee table
const removeEmployee = () => {
    //Grabs a list of employees from the query below and stores it into the list of employees array
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

    //Inquirer to choose the employee to delete from the employee table
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

//Add role to role table
const addRole = () => {
    //Store a list of departments into an array from using the query below
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

    //Inquirer to get the rold infomation and add into to the role table
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

//Remove role from role table
const removeRole = () => {
    //Stores a list of roles from the role table in a array, using the query below to get the role info
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

    //Inquirer to select the role to be deleted from the role table
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

//Add department to department table
const addDepartment = () => {
    //Inquirer to get the department name and add it onto the department table
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

//Remove department from department table
const removeDepartment = () => {
    //Grabs the list of departments from the query below and adds the list to the list of departments array
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

    //Inquirer to choose which department to delete from the department table
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

//When connection is active, it calls the start() function
connection.connect((err) => {
    if (err) throw err;
    start();
})



