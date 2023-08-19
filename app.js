// const signUpButton = document.getElementById('signUp');
// const signInButton = document.getElementById('signIn');
// const container = document.getElementById('container');

// signUpButton.addEventListener('click', () => {
// 	container.classList.add("right-panel-active");
// });

// signInButton.addEventListener('click', () => {
// 	container.classList.remove("right-panel-active");
// });

///CODED BY Jitendra Mewada

//we want to connect to the database
//with the help of express js 
//and mysql



//express
const express = require('express');
const app = express();
const ejs = require('ejs');
const bodyParser = require('body-parser');


//mysql
const mysql = require('mysql2');
const path = require('path');

//adding the views
app.set('view engine', 'ejs');
//config for views
//MIDDLEWARES
app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());



//dot enforces the use of environment variables

//bycrypt for encrypting passwords
// const bcrypt = require("bcrypt");

//creating routes for the app

// app.use("/",(res,req,next)=>{
//         console.log(req.url);
//         next();
//     }
// );
console.log(path.join(__dirname,'public','images'));
console.l


app.use(express.static(path.join(__dirname,'public')));

app.get("/",(req,res)=>{
    // res.render('index');
    res.render("index");
    // res.render('index');
});

app.get("/Signin_index",(req,res)=>{
    res.render("Signin_index");
    });

    app.get("/SignUp",(req,res)=>{
        res.render("SignUp");
        });

// app.get("/public/css/style.css",(req,res)=>{
//     res.sendFile(path.join(__dirname,'public','css','style.css'));
// }
// );

// app.get("/public/javascript/script.js",(req,res)=>{
//     res.sendFile(path.join(__dirname,'public','javascript','script.js'));
// }
// );


    
app.listen(3000,()=>{
    console.log('server is running on port 3000');
}
);



require("dotenv").config();
//connection to the database

const DB_HOST = process.env.DB_HOST
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_DATABASE = process.env.DB_DATABASE
const DB_PORT = process.env.DB_PORT

const db = mysql.createPool({
   host: DB_HOST,
   user: DB_USER,
   password: DB_PASSWORD,
   database: DB_DATABASE,
})






// const db = mysql.createPool({

//     host : 'localhost',
//     user : 'root',
//     password : 'hello123',
//     database : 'userDB'
// });

db.getConnection( (err, connection)=> {
    if (err) throw (err)
    console.log ("DB connected successful: " + connection.threadId)
 })

console.log("Welcome to EasyMed-HealthCare");




//////////////////////////////////////////////////////////////////////////////////////////////
//registration page ---------------------------------------------------



const bcrypt = require("bcrypt")
app.use(express.json())
//middleware to read req.body.<params>
//CREATE USER
app.post("/createUser", async (req,res) => {
const user = req.body.email;
const hashedPassword = await bcrypt.hash(req.body.password,10);
console.log("user :" + req.body.user);
console.log("password: " + req.body.password);
db.getConnection( async (err, connection) => {
 if (err) throw (err)
 const sqlSearch = "SELECT * FROM adminTable WHERE user = ?"
 const search_query = mysql.format(sqlSearch,[user])
 const sqlInsert = "INSERT INTO adminTable VALUES (0,?,?)"
 const insert_query = mysql.format(sqlInsert,[user, hashedPassword])
 // ? will be replaced by values
 // ?? will be replaced by string
 connection.query(search_query, async (err, result) => {
        if (err)
            throw (err);
        console.log("------> Search Results");
        console.log(result.length);
        if (result.length != 0) {
            connection.release();
            console.log("------> User already exists");
            res.sendStatus(409);
        }
        else {
                connection.query(insert_query, (err, result) => {
                connection.release();
                if (err)
                    throw (err);
                console.log("--------> Created new User");
                console.log(result.insertId);
                res.sendStatus(201);
            });
        }
    }) //end of connection.query()
 //end of connection.query()
}) //end of db.getConnection()
}) //end of app.post()






//*********************************END OF THE REGISTRATION PAGE ************************************************************** */





//login page---------------------------------------------------------------------------------------------------------------------

 //LOGIN (AUTHENTICATE USER)
app.post("/login", (req, res)=> {
    console.log("------> Login Request");
    console.log("------> User: " + req.body.email);
    console.log("------> Password: " + req.body.password);
    const user = req.body.email
    const password = req.body.password
    db.getConnection ( async (err, connection)=> {
     if (err) throw (err)
     const sqlSearch = "Select * from adminTable where user = ?"
     const search_query = mysql.format(sqlSearch,[user])
     connection.query(search_query, async (err, result) => {
            connection.release();
            if (err)
                throw (err);
            if (result.length == 0) {
                console.log("--------> User does not exist");
                res.sendStatus(404);
            }
            else {
                const hashedPassword = result[0].password;
                console.log(typeof(result));
                
                //get the hashedPassword from result
                if (await bcrypt.compare(password, hashedPassword)) {
                   var admin_app_fun= function(){ console.log("---------> Login Successful");
                                        //  console.log(result);
                    // res.send(`${user} is logged in!`);
                    const apt_search = "SELECT * FROM appointmentTable";
                    connection.query(apt_search, (err, results) => {
                        if (err)
                            throw (err);
                        // console.log(results);
                        // console.log(results.length);
                        res.render("admin", {
                            results: results
                        });
                    });  
                    };            
                    admin_app_fun();

                }
                else {
                    console.log("---------> Password Incorrect");
                    res.send("Password incorrect!");
                } //end of bcrypt.compare()
            } //end of User exists i.e. results.length==0
        }) //end of connection.query()
 //end of connection.query()
    }) //end of db.connection()
    }) //end of app.post()
    

    ///end the login request ---------------------------------------------------------------------------------------------------------------------


   //******************************BOOKING APPOINTMENTS PAGE ***************************************************************************************** */

   app.post("/book_appointment", (req, res)=> {
    console.log("------> Book Appointment Request");
    let cus_name = req.body.cus_name;
    let cus_no = req.body.cus_no;
    let cus_email = req.body.cus_email;
    console.log(req.body.app_date);
    let date_app_date= new Date(req.body.app_date);
    let doctor_name = req.body.doctor_name;

    //converting the data to string to store it into the database
    let string_app_date= date_app_date.toISOString().slice(0,10);

    console.log(string_app_date);

    // let app_date = req.body.app_date;
    console.log("------> Customer Name: " + cus_name);
    console.log("------> Customer Number: " + cus_no);
    console.log("------> Customer Email: " + cus_email);
    console.log("------> Appointment Date: " + string_app_date);
    console.log("------> Doctor Name: " + doctor_name);
    
    db.getConnection ( async (err, connection)=> {
    const sqlInsert = "INSERT INTO appointmentTable VALUES (0,?,?,?,?,?)"
    const insert_query = mysql.format(sqlInsert,[cus_name, cus_no, cus_email, string_app_date, doctor_name]);

    connection.query(insert_query, (err, result) => {
        if (err){
            throw (err);
            
        }
        console.log("--------> Created new Appointment");
        
        res.sendStatus(201);
    });
});
});

//******************************END OF BOOKING APPOINTMENTS PAGE ***************************************************************************************** */


//******************************FEEDBACK PAGE ***************************************************************************************** */

app.get("/feedback", (req, res)=> {
    res.render("feedback");
}
);

app.post("/add_review", (req, res)=> {
    console.log("hello in add review section" );
    console.log("------> Add review Request");
    let rwr_name = req.body.rwr_name;
    let rwr_email = req.body.rwr_email;
    let rwr_text = req.body.rwr_text;

    console.log("------> Reviewer Name: " + rwr_name);
    console.log("------> Reviewer Email: " + rwr_email);
    console.log("------> Review: " + rwr_text);
    
    db.getConnection ( async (err, connection)=> {
    const sqlInsert = "INSERT INTO Reviews VALUES (0,?,?,?)"
    const insert_query = mysql.format(sqlInsert,[rwr_name, rwr_email, rwr_text]);

    connection.query(insert_query, (err, result) => {
        if (err){
            throw (err);
            
        }
        console.log("--------> review added");
        
        res.sendStatus(201);
});
});
}
);

//******************************END OF FEEDBACK PAGE ***************************************************************************************** */

//******************************SHOW  REVIEWS TO ADMIN  PAGE ***************************************************************************************** */

app.get("/admin_review", (req, res)=> {

    db.getConnection ( async (err, connection)=> {
        const apt_search = "SELECT * FROM Reviews";
        connection.query(apt_search, (err, results) => {
        if (err)
            throw (err);
        // console.log(results);
        // console.log(results.length);
        res.render("admin_review", {

        results: results
 
        });
    });
    });
});
//************************************************** RELOGIN************************************* */

app.get("/relogin", (req, res)=> {
   db.getConnection ( async (err, connection)=> {
    console.log("---------> doing relogin");
//res.send(`${user} is logged in!`);
const apt_search = "SELECT * FROM appointmentTable";
connection.query(apt_search, (err, results) => {
if (err)
throw (err);
// console.log(results);
// console.log(results.length);
res.render("admin", {
results: results
});
}); 
});
}
);



//************************************************** END OF RELOGIN************************************* */

