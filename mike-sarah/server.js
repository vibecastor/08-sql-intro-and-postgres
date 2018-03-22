'use strict';
const pg = require('pg');
const fs = require('fs');
const express = require('express');

const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const app = express();

const conString = 'postgres://localhost:5432';

const client = new pg.Client(conString);

// DONE: Use the client object to connect to our DB.
client.connect();


// DONE: Install the middleware plugins so that our app can use the body-parser module.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('./public'));


// DONE: Routes for requesting HTML resources
app.get('/new', (request, response) => {
  // DONE: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // Since this is the only html route in the code this line is equivalent to This is number 2 "request," number 5 "response" as well as number 1 from the diagram.
  //This code interacts with insertRecord method in articles.js.
  //This is the "read" portion of CRUD because we are calling app.get.
  response.sendFile('new.html', { root: './public' });
});


// DONE: Routes for making API calls to use CRUD Operations on our database
app.get('/articles', (request, response) => {
  // DONE: What number(s) of the full-stack-diagram.png image correspond to the following line of code?
  //This code corresponds to item number 3 as well as number 4 in the diagram.
  //Which method of article.js is interacting with this particular piece of `server.js`?
  //This code is interacting with Article.fetchAll because we are asking the database to send us all of the articles.
  //What part of CRUD is being enacted/managed by this particular piece of code?
  // This is still a CRUD: READ action.
  client.query('SELECT * FROM articles;')
    .then(function(result) {
      response.send(result.rows);
    })
    .catch(function(err) {
      console.error(err)
    })
});

app.post('/articles', (request, response) => {
  // DONE: What number(s) of the full-stack-diagram.png image correspond to the following line of code?
  //This is number 3 and 4 in the diagram.
  //Which method of article.js is interacting with this particular piece of `server.js`?
  //This code interacts with Article.prototype.insertRecord because we are posting a new article.
  //What part of CRUD is being enacted/managed by this particular piece of code?
  //  This is CRUD: create.
  client.query(
    `INSERT INTO
    articles(title, author, "authorUrl", category, "publishedOn", body)
    VALUES ($1, $2, $3, $4, $5, $6);
    `, [
      request.body.title,
      request.body.author,
      request.body.authorUrl,
      request.body.category,
      request.body.publishedOn,
      request.body.body
    ]
  )
    .then(function() {
      response.send('insert complete')
    })
    .catch(function(err) {
      console.error(err);
    });
});

app.put('/articles/:id', (request, response) => {
  // DONE: What number(s) of the full-stack-diagram.png image correspond to the following line of code?
  //This is numbers 3 and 4 in the diagram.
  //Which method of article.js is interacting with this particular piece of `server.js`?
  //This code interacts with updateRecord.
  //What part of CRUD is being enacted/managed by this particular piece of code?
  //This is CRUD: update.
  client.query(
    `UPDATE articles SET title=$1, author=$2, "authorUrl"=$3, category=$4, "publishedOn"=$5, body=$6 WHERE article_id=$7;`, [
      request.body.title,
      request.body.author,
      request.body.authorUrl,
      request.body.category,
      request.body.publishedOn,
      request.body.body,
      request.params.id]
  )
    .then(() => {
      response.send('update complete')
    })
    .catch(err => {
      console.error(err);
    });
});

app.delete('/articles/:id', (request, response) => {
  // DONE: What number(s) of the full-stack-diagram.png image correspond to the following line of code?
  //This is 3 and 4 from the diagram.
  //Which method of article.js is interacting with this particular piece of `server.js`?
  //This code interacts with deleteRecord.
  //What part of CRUD is being enacted/managed by this particular piece of code?
  // This is CRUD: destroy.
  client.query(
    `DELETE FROM articles WHERE article_id=$1;`, [request.params.id]
  )
    .then(() => {
      response.send('Delete complete')
    })
    .catch(err => {
      console.error(err);
    });
});

app.delete('/articles', (request, response) => {
  // DONE: What number(s) of the full-stack-diagram.png image correspond to the following line of code?
  //This is numbers 3 and 4 in the diagram.
  //Which method of article.js is interacting with this particular piece of `server.js`?
  //This is interacting with article.truncateTable.
  //What part of CRUD is being enacted/managed by this particular piece of code?
  // This is CRUD: destroy.
  client.query(
    `DELETE FROM articles;`
  )
    .then(() => {
      response.send('Delete complete')
    })
    .catch(err => {
      console.error(err);
    });
});

// DONE: What is this function invocation doing?
// This function creates the database if it doesn't exist. Otherwise, it just loads it.
loadDB();

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}!`);
});


//////// ** DATABASE LOADER ** ////////
////////////////////////////////////////
function loadArticles() {
  // DONE: What number(s) of the full-stack-diagram.png image correspond to the following line of code?
  //This is numbers 3 and 4 in the diagram.
  //Which method of article.js is interacting with this particular piece of `server.js`?
  // This code interacts with Article.fetchAll.
  //What part of CRUD is being enacted/managed by this particular piece of code?
  //This is CRUD: read.
  client.query('SELECT COUNT(*) FROM articles')
    .then(result => {
      // DONE: result.rows is an array of objects that PostgreSQL returns as a response to a query.
      // If there is nothing on the table, then result.rows[0] will be undefined, which will make count undefined. parseInt(undefined) returns NaN. !NaN evaluates to true.
      // Therefore, if there is nothing on the table, line 158 will evaluate to true and enter into the code block.
      if (!parseInt(result.rows[0].count)) {
        fs.readFile('./public/data/hackerIpsum.json', 'utf8', (err, fd) => {
          JSON.parse(fd).forEach(ele => {
            client.query(`
              INSERT INTO
              articles(title, author, "authorUrl", category, "publishedOn", body)
              VALUES ($1, $2, $3, $4, $5, $6);
            `, [ele.title, ele.author, ele.authorUrl, ele.category, ele.publishedOn, ele.body])
          })
        })
      }
    })
}

function loadDB() {
  // DONE: What number(s) of the full-stack-diagram.png image correspond to the following line of code?
  //This is numbers 3 and 4 in the diagram.
  //Which method of article.js is interacting with this particular piece of `server.js`?
  //This code interacts with Article.loadAll.
  //What part of CRUD is being enacted/managed by this particular piece of code?
  // The ic CRUD: create because we are creating the articles.
  client.query(`
    CREATE TABLE IF NOT EXISTS articles (
      article_id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      "authorUrl" VARCHAR (255),
      category VARCHAR(20),
      "publishedOn" DATE,
      body TEXT NOT NULL);`)
    .then(() => {
      loadArticles();
    })
    .catch(err => {
      console.error(err);
    });
}