// get the client
const mysql = require('mysql2');
const express = require('express');
const bodyparser = require('body-parser');
const notifier = require('node-notifier');




var app = express();
app.use(bodyparser.json());

// create the connection to database
const mysqlConnection = mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: 'root',
    database: 'interviewdb',
    multipleStatements: true
  });

mysqlConnection.connect((err) => {
    if(!err){
        console.log('DB connection succeeded');
    }
    else{
        console.log('DB connection failed \n Error : ' + JSON.stringify(err, undefined, 2));
    }
});

app.listen(3000, () => console.log('Express server is running at port no : 3000'));


// Get all employees
app.get('/employee', (req, res)=>{
    mysqlConnection.query('SELECT * FROM tblapplicant', (err, rows, fields) =>{
        if(!err){
            res.send(rows);
        }
        else{
            console.log(err);
        }
    })
}); 


// Get an employees
// /employee/1
app.get('/employee/:id', (req, res)=>{
mysqlConnection.query('SELECT * FROM tblapplicant WHERE ID = ?', [req.params.id], (err, rows, fields) =>{
    if(!err){
        res.send(rows);
    }
    else{
        console.log(err);
    }
})
});

// Delete an employee
app.delete('/employee/:id', (req, res)=>{
    mysqlConnection.query('DELETE FROM tblapplicant WHERE ID = ?', [req.params.id], (err, rows, fields) =>{
        if(!err){
            res.send('Delete successfully.');
        }
        else{
            console.log(err);
        }
    })
});

// Insert an employee
app.post('/employee', (req, res) => {
    let emp = req.body;
    // var arr = [emp.ID, emp.FirstName, emp.LastName, emp.Email, emp.MobileNo,  emp.Birthdate];
    // console.log(arr);
    var sql = "SET @ID = ?;SET @FirstName = ?;SET @LastName = ?;SET @Email = ?;SET @MobileNo = ?;SET @Birthdate = ?; \
    INSERT INTO tblapplicant VALUES (@ID, @FirstName, @LastName, @Email, @MobileNo, @Birthdate)";
    mysqlConnection.query(sql, [emp.ID, emp.FirstName, emp.LastName, emp.Email, emp.MobileNo, emp.Birthdate], (err, rows, fields) => {
        if (!err){
            res.send("Inserted succesfully");
            notifier.notify({
                title: 'New Message from tblapplicant DB',
                message: `${emp.FirstName}Employee Added successfully!`
              });
        }
        else{
            console.log(err);
        }
    })
});

