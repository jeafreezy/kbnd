const express = require('express');
const app = express()
const PORT = 3000;
const { Client } = require('pg')

app.use(express.json())

const client = new Client({

    //Heroku username
    user: 'postgres',

    //Enter heroku url
    host: 'localhost',

    //Database name
    database: 'postgres',

    //YOUR PASSWORD HERE
    password: '',

    port: 5432,

});


//Query for creating tables
const query = `CREATE TABLE IF NOT EXISTS users (
    username varchar NOT NULL UNIQUE,
    password varchar NOT NULL);
    CREATE TABLE IF NOT EXISTS mapinfo(
    id SERIAL,
    date varchar,
    time varchar,
    variant varchar,
    pin varchar,
    map_details json
    );
    `;

//Connecting to DB

client.connect()


//Executing Create Table Query

client.query(query, (err, res) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log('Database Successfully started');
})


//Route to create New user
app.post('/', (req,res)=>{
    let username = req.body.username.toLowerCase();
    let password = req.body.password;
    let query = `INSERT INTO USERS VALUES(
            '${username}',
            '${password}')`
    client.query(query,(err,result)=>{
        if (err) {
            console.error(err);
            //ERROR PAGE
            res.json({message:"Sorry there is some error"});
        }else {
            console.log('User added');
            //Add page after register here
            res.send("DONE")
        }
    })
})

//Route for user login
app.post('/login', (req,res,next)=>{
    let username = req.body.username.toLowerCase();
    let password = req.body.password;
    let query =
        `SELECT * FROM USERS
         WHERE username='${username}'`
    client.query(query,(err,result)=>{
        if (err) {
            console.error(err);
            //ERROR PAGE
            res.json({message:"Sorry there is some error"});
        }else {
            if(result.rows[0].password===password)
            {
                //Show Login Success
                res.send("USER LOGIN SUCCESS")
                return next();
            }else{
                //Show login failed
                res.json("USER LOGIN FAILED")
                return next();
            }
        }
    })
})
//To create a new Object
app.post('/mapInfo', (req,res)=>{

    let style = req.body.style;
    let zoom = req.body.zoom;
    let center = req.body.center;
    let bearing = req.body.bearing;
    let pitch = req.body.pitch;
    let pin = req.body.pin;
    let date = req.body.date;
    let time = req.body.time;
    let variantColor = req.body.variantColor;
    let variantSize = req.body.variantSize;

    let variant = variantSize + "," + variantColor;

    let map_details = JSON.stringify({

        "style":`${style}`,
        "zoom":`${zoom}`,
        "center":`${center}`,
        "bearing":`${bearing}`,
        "pitch":`${pitch}`

    });


    let hasPin = pin !== "undefined" ? pin : 'Nil';


    let query = `INSERT INTO mapinfo(date,time,variant,pin,map_details) VALUES(

            '${date}',
            '${time}',
            '${variant}',
            '${hasPin}',
            '${map_details}');`;

    client.query(query,(err,result)=>{

        if (err) {
            console.error(err);

            //ERROR PAGE
            res.json({message:"Sorry there is some error"});

        }else {
            console.log('Object inserted');
            //Send response for inserted Object
            res.json("Object Inserted")
        }
    })
});



//Display all objects
app.get('/mapdata', (req,res,next)=>{
    let query =
        `SELECT * FROM mapinfo;`
    client.query(query,(err,result)=>{
        if (err) {
            console.error(err);
            res.json({message:"Sorry there is some error"});
        }else {
            if (result.rows.length > 0) {
                res.json({message: "Success", objects: result.rows})
                return next();
            } else {
                res.send("NO DATA AVAILABLE");

            }
        }
    })
});

//Delete an object
app.delete('/delete/:id',(req,res)=>{

    let id =req.params.id;
    let query =
        `DELETE FROM mapinfo
         WHERE id=${id}`
    client.query(query,(err,result)=>{
        if (err) {
            console.error(err);
            res.json({message:"Sorry there is some error"});
        }else {
            if(result.rowCount===1){
                console.log("ROW DELETED")
                res.json({success:1,message:"Row Deleted"})
            }else {
                console.log("ROW NOT FOUND")
                res.json({success:1,message:"Row Not found"})

            }
        }
    })
})

app.listen(process.env.PORT|| PORT,()=>{
    console.log(`Server running on port ${process.env.PORT}`)
});
