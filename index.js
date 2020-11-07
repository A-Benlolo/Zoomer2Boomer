const mysql = require('mysql');
const express = require('express')

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "z2b"
});

connection.connect(err => {
    if(err) throw err
    console.log("MySQL Connected");
});

const app = express();

app.listen('3000', () => {console.log("Server Started on port 3000")});
app.use(express.static('public'));

app.get('/query/:term', (request, response) => {
    let sql = `SELECT * FROM word WHERE term='${request.params.term}'`
    connection.query(sql, (err, result) => {
        if(err) throw err
        response.json(result)
    })
})
