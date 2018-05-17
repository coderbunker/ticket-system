const express = require('express');
const session = require('cookie-session');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const uuid = require('uuid/v4');
const pg = require('pg');
const { Client } = require('pg');
const pool = new pg.Pool();
const connectionString = process.env.DATABASE_URL;
const client = new Client({
  host: connectionString,
  port: process.env.PORT || 5432,
  user: 'crhmioxrgicttd',
  password: '483a2752c65fffcf08a86647a4f10c49861a21bc5016595914d0b49b035bc1ac',
  connectionString: connectionString,
  ssl: true,
});
const app = express();

client.connect();

app.get('/', (req, res) => {
  res.render('index.ejs');
})

// VIEW PROBLEM BUTTON
app.get('/problem/', urlencodedParser, (req, res) => {
  res.render('problem.ejs');
})

// CREATE TICKET USING SUBMIT FORM
app.post('/problem/add/', urlencodedParser, (req, res) => {
  const now = new Date();
  client.query("INSERT INTO tickets (uuid, description, resolved, time) values ('" + uuid() + "', '" + req.body.newproblem + "', 'false', '" + now.toTimeString() + "')", (err, res) => {
    if (err) {
      console.error(err);
      response.send("CREATE Error: " + err);
    }
  });
  res.redirect('/problem/');
})

// CREATE TICKET FROM CMS APP
app.get('/problem/add/:uuid/', urlencodedParser, (req, res) =>
  let _uuid;
  if(req.params.uuid){
    _uuid = req.params.uuid;
  }
  const now = new Date();
  client.query("INSERT INTO tickets (uuid, description, resolved, time) values ('" + _uuid + "', '" + undefined + "', 'false', '" + now.toTimeString() + "')", (err, res) => {
    if (err) {
      console.error(err);
      response.send("CREATE Error: " + err);
    }
  });
  res.redirect('/problem/');
})

// READ TICKETS
app.get('/tickets', (request, response) => {
  client.query('SELECT * FROM tickets', (err, res) => {
    if (err) {
      console.error(err);
      response.send("READ Error: " + err);
    }
    response.render('tickets.ejs', {tickets: res.rows});
  });
})

// UPDATE TICKET ASSIGNED
app.get('/tickets/assigned/:id', urlencodedParser, (req, res) => {
  let id = req.params.id;
  client.query("UPDATE tickets SET assigned = '" + req.query.newassigned + "' WHERE uuid = '" + id + "'", (err, rows) => {
    if(err){
      console.error(err);
      res.send("UPDATE Assigned Error: " + err);
    }
  });
  res.redirect('/tickets');
})

// UPDATE TICKET RESOLVED
app.get('/tickets/resolved/:id', (req, res) => {
  let id = req.params.id;
  client.query("UPDATE tickets SET resolved = NOT resolved WHERE uuid = '" + id + "'", (err, rows) => {
    if(err){
      console.error(err);
      res.send("UPDATE Resolved Error: " + err);
    }
  });
  res.redirect('/tickets');
})

// DELETE TICKET
app.get('/tickets/delete/:id', (req, res) => {
  let id = req.params.id;
  client.query("DELETE FROM tickets WHERE uuid = '" + id + "'", (err, rows) => {
    if(err){
      console.error(err);
      res.send("DELETE Error: " + err);
    }
  });
  res.redirect('/tickets');
});

const port = process.env.PORT || 2345;

app.listen(port, () => {
  console.log(`working on ${port}`);
});
