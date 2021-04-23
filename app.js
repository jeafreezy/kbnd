const express = require('express');
const app = express();
var cors = require('cors');
const { Client } = require('pg');
const Shopify = require('shopify-api-node');


//Shopify client connection

const shopify = new Shopify({
    shopName: 'kushion-studio',
    apiKey: '2eeb102c9ef2f51efbed580c9697ec39',
    password: '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',
    autoLimit: true,
});

const PORT = 3000;

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(cors());
app.use(express.json());

const client = new Client({

    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    
    // user:'postgres',

    // database:'postgres',

    // host:'localhost',
    
    // port:5432,

    // password:''


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
    token varchar,
    productID varchar,
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

app.get('/', (req,res)=>{

    res.json('It is working fine')
}

);


//Route to create New user
app.post('/register', (req,res)=>{

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
            res.send({success:'DONE'})
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
                res.send({success:"USER LOGIN SUCCESS"})
                return next();
            }else{
                //Show login failed
                res.json({error:"USER LOGIN FAILED"})
                return next();
            }
        }
    })
})


//To create a new Map Object
app.post('/mapInfo', (req,res)=>{

    let style = req.body.style;
    let zoom = req.body.zoom;
    let center = req.body.center;
    let bearing = req.body.bearing;
    let pitch = req.body.pitch;
    let token = req.body.token;
    let productID = req.body.productID;
    let date = req.body.date;
    let time = req.body.time;
    let variantColor = req.body.variantColor;
    let variantSize = req.body.variantSize;
    let width=req.body.canvasWidth;
    let height=req.body.canvasHeight;
    let browserWidth=req.body.browserWidth;
    let browserHeight=req.body.browserHeight;
    let browserIP=req.body.borwserIP;

    let variant = variantSize + "," + variantColor;

    let centerLatLng=[center.lat,center.lng]
    // let centerLatLng=[1,1]

    let map_details = JSON.stringify({

        "style":`${style}`,
        "zoom":`${zoom}`,
        "center":`${centerLatLng}`,
        "bearing":`${bearing}`,
        "pitch":`${pitch}`,
        "width":`${width}`,
        "height":`${height}`,
        "browserHeight":`${browserHeight}`,
        "browserIP":`${browserIP}`,
        "browserWidth":`${browserWidth}`

    });


    let query = `INSERT INTO mapinfo(date,time,variant,token,productID,map_details) VALUES(

            '${date}',
            '${time}',
            '${variant}',
            '${token}',
            '${productID}',
            '${map_details}');`;

    client.query(query,(err,result)=>{

        if (err) {
            console.error(err);

            //ERROR PAGE
            res.json({message:"Sorry there is some error"});

        }else {

            console.log('Object inserted');
            //Send response for inserted Object
            res.json({success:"Object Inserted"})
        }
    })
});



//Fetch all items added stored in the mapinfo table

app.get('/addedToCart', (req,res,next)=>{

    let query =
        `SELECT * FROM mapinfo;`

    client.query(query,(err,result)=>{

        if (err) {

            console.error(err);

            res.json({message:"Sorry there is some error"});

        }else {

            if (result.rows.length > 0) {


                res.json({message: "Success", payload: result.rows})

                return next()
                

            } else {

                res.send({error:"NO DATA AVAILABLE"});

            }
        }
    })
});


//fetch the orders from shopify

app.get('/orders',(req,res,next)=>{

    shopify.order
    .list()
    .then(data=>res.json({message: "Success",payload:data}))
    .catch((err) =>{console.error(err)});

})



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
    // console.log(`Server running on port ${process.env.PORT}`)
    console.log(`Server running on port ${PORT}`)
 
});
