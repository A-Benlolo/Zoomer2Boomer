const mysql = require('mysql');
const express = require('express')
const puppeteer = require('puppeteer');

// Create a MySQL connection
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "z2b"
});

// Connect the MySQL database to the server
connection.connect(err => {
    if(err) throw err
    console.log("MySQL Connected");
});

// Initialize express
const app = express();

// Setup express
app.listen('3000', () => {console.log("Server Started on port 3000")});
app.use(express.static('public'));
app.set('view engine', 'pug')

// Create the GET to query for a term and return the corresponding rows
app.get('/query/:term', (request, response) => {
    let sql = `SELECT * FROM word WHERE term="${request.params.term}"`
    connection.query(sql, (err, result) => {
        if(err) throw err
        response.json(result)
    })
})

// Create the GET to scrape for the definition of a term
app.get('/scrape/:term', (request, response) => {
    puppeteer.launch().then(async function(browser) {
        const page = await browser.newPage();
        await page.goto("https://api.urbandictionary.com/v0/define?term="+`${request.params.term}`);

        // Get the HTML of the page
        let html = await page.evaluate(() => document.body.innerHTML);
        var parsed = html.split("\"");

        // Initialize the definition
        var definition;

        // There is no definition
        if(parsed[7] == null || !html.includes(`${request.params.term}`))
            definition = null;

        // The definition had quotes in it (the easy case)
        else if(parsed[8] != ",") {
            // Get the unsanitized definition
            definition = parsed[8].toLowerCase();

            // Remove square brackets and backslashes
            definition = definition.replace(/[\[\]\\']+/g,'')
        }

        // The definition needs to heavily sanitized
        else {
            // Get the unsanitized definition
            definition = parsed[7].toLowerCase();

            // Remove square brackets
            definition = definition.replace(/[\[\]']+/g,'')

            // Remove the word itself being used in the definition
            definition = definition.replace(`${request.params.term}`, "");

            // Remove any instance of introduction phrases (should be ending in a space)
            var introPhases = [
                "when something is ",
                "word used instead of ",
                "a word used instead of ",
                "acronym for ",
                "is a hybrid between ",
                "a hybrid between ",
                "is another way of saying ",
                "another way of saying ",
                "1) ",
                "1)",
                "1. ",
                "1.",
                "&lt;",
                "(as a verb) ",
                "(as a noun) ",
                "(as an adjective) ",
                "similar to ",
            ]
            for(var i = 0; i < introPhases.length; i++)
                definition = definition.replace(introPhases[i], "");
            
            // Get the sentence fragment before any puncuation
            var puncuations = [
                ".",
                ",",
                ";",
                "--",
                "\\r",
            ]
            for(var i = 0; i < puncuations.length; i++)
                [definition] = definition.split(puncuations[i]);

        // Remove an introductory words (should be ending in a space)
        var introWords = [
            "to ",
            "a ",
            "any ",
        ]
        for(var i = 0; i < introWords.length; i++) 
            if(definition.startsWith(introWords[i]))
                definition = definition.replace(introWords[i], "");

        // Get the lefthand side of an or statement
        [definition] = definition.split(" or ");
        [definition] = definition.split(" but ");

        // Replace + with and
        definition = definition.replace("+", "and");
        }

        await browser.close();

        // If the definition is not null, remove most punctuation
        (definition == null)? definition = definition : definition = definition.replace(/[^\w\s']|_/g, "");

        // Send the definition
        response.send(definition);
    })
})
