// get the client
const mysql = require('mysql2');
const express = require('express');
const bodyparser = require('body-parser');
const notifier = require('node-notifier');
const cron = require('node-cron');
const nodemailer = require('nodemailer');


// fun{
//  1 query - return arr -i d, mail
//  2 node mailer use arr- loop send mail
// }




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




// cron.schedule("*/2 * * * * *", function() {
//     console.log("running a task every 10 second");
// });

// SELECT users.id, DATE_FORMAT(users.signup_date, '%Y-%m-%d') 
// FROM users 
// WHERE DATE(signup_date) = CURDATE()
// SELECT * 
// FROM tableName 
// WHERE month(Birthdate) = month(CURDATE()) and day(Birthdate) = day(CURDATE())



// cron job run on ever 10 sec   for 8am evey day  "0 8 * * *"
cron.schedule("*/10 * * * * *", function() {
    findDate();
    //console.log(arr);
});


function findDate (){
    //var sql = "SELECT FirstName, Email, DATE_FORMAT(Birthdate, '%Y-%m-%d') FROM tblapplicant WHERE DATE(Birthdate) = CURDATE()";
    var sql = "SELECT FirstName, Email, Birthdate FROM tblapplicant WHERE month(Birthdate) = month(CURDATE()) and day(Birthdate) = day(CURDATE())";
    mysqlConnection.query(sql, (err, rows, fields) =>{
        if(!err){
            rows.forEach((emp) => {
                var mail = emp.Email;
                sendMail(mail);
            })
            

        }
        else{
            console.log(err);
        }
    });

    
}

// Send Mail function using Nodemailer
function sendMail(mail) {
    let mailTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'megane.sanford83@ethereal.email',
            pass: 'fMsAxetBUBhR4g5c8x'
        }
    });
      
    // Setting credentials
    let mailDetails = {
        from: "megane.sanford83@ethereal.email",
        to: `${mail}`,
        subject: "Test mail using Cron job",
        text: "Node.js cron job email"
    };
      
      
    // Sending Email
    mailTransporter.sendMail(mailDetails, function(err, data) {
        if (err) {
            console.log("Error Occurs", err);
        } else {
            console.log("Email sent successfully");
        }
    });
}