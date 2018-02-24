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
  // TODO CUT OUT SOME OF THIS TO SEE WHAT IS NEEDED
  host: connectionString,
  port: process.env.PORT || 5432,
  user: 'crhmioxrgicttd',
  password: '483a2752c65fffcf08a86647a4f10c49861a21bc5016595914d0b49b035bc1ac',
  connectionString: connectionString,
  ssl: true,
});
const app = express();

client.connect();

// VIEW PROBLEM BUTTON
app.get('/problem', (req, res) => {
  // TODO TURN INTO A BUTTON/LINK FOR THE INVENTORY SERVER
  res.render('problem.ejs');
})

// CREATE TICKET
app.post('/problem/add/', urlencodedParser, (req, res) => {
  const now = new Date();
  client.query("INSERT INTO tickets (uuid, description, resolved, time) values ('" + uuid() + "', '" + req.body.newproblem + "', 'false', '" + now.toTimeString() + "')", (err, res) => {
    if (err) {
      console.error(err);
      response.send("CREATE Error: " + err);
    }
  });
  res.redirect('/problem');
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
  console.log('DA WHOLE BODY: ', req.body);
  client.query("UPDATE tickets SET assigned = '" + req.body.newassigned + "' WHERE uuid = '" + id + "'", (err, rows) => {
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

// TESTING PORT
// .listen(8080);

const port = process.env.PORT || 1234;

app.listen(port, () => {
  console.log(`working on ${port}`);
});
