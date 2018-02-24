const express = require('express');
const session = require('cookie-session');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
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

// COOKIES
// TODO ANYTHING WITH SESSION WILL NEED TO CHANGE TO ACCESS THE DB VIA CLIENT OR QUERY OR IDK
app.use(session({secret: 'topsecret'}))

// CREATE EMPTY ARRAY
.use((req, res, next) => {
  if (typeof(req.session.tickets) == 'undefined') {
    req.session.tickets = [];
  }
  next();
})

// VIEW PROBLEM
// TODO TURN INTO A BUTTON/LINK FOR THE INVENTORY SERVER
.get('/problem', (req, res) => {
  res.render('problem.ejs', {tickets: req.session.tickets});
})

// VIEW TICKETS
.get('/tickets', (request, response) => {
  client.connect();
  client.query('SELECT * FROM tickets', (err, res) => {
    if (err) {
      console.error(err);
      response.send("Not Good... Error " + err); }
    else {
      response.render('tickets.ejs', {tickets: res.rows});
    }
    client.end();
  });
})

// ADD TICKET
// toy-ticket-heroku::DATABASE=> insert into tickets (id, name) values (2, 'some oy');
.post('/problem/add/', urlencodedParser, (req, res) => {
  const now = new Date();
  // if (req.body.newproblem == '') {
  //   req.session.tickets.push({time: now.toTimeString(), problem: 'No description.', update: false });
  // }else{
    // req.session.tickets.push({time: now.toTimeString(), problem: req.body.newproblem, update: false });
  // }
  // res.redirect('/problem');
  //
  client.connect();
// " + req.body.newproblem + ", " + now.toTimeString() + "
  client.query("INSERT INTO tickets (uuid, description, time) values ('A0EEBC99-9C0B-4EF8-BB6D-6BB9BD380A12', 'filler problem description', 'filler time')", (err, res) => {
    if (err) {
      console.error(err);
      response.send("Breaking thing... Error " + err); }
    else {
  res.redirect('/problem');
    }
    client.end();
  });
})

// DELETE TICKET
// delete from cd.members where memid = 37;
.get('/tickets/delete/:id', (req, res) => {
  if (req.params.id != '') {
    req.session.tickets.splice(req.params.id, 1);
  }
  res.redirect('/tickets');
})

// MODIFY TICKET DETAILS
.get('/tickets/update/:id', (req, res) => {
  req.session.tickets[req.params.id].update ? req.session.tickets[req.params.id].update = false : req.session.tickets[req.params.id].update = true;
  res.redirect('/tickets');
})

// ACCESS DB
.get('/db', (request, response) => {
  client.connect();
  client.query('SELECT * FROM tickets', (err, res) => {
    if (err) {
      console.error(err);
      response.send("Not Good: Error " + err); }
    else {
      response.render('database.ejs', {results: res.rows});
    }
    client.end();
  });
});

// LIMIT WHERE USER CAN ACCESS
// .use((req, res, next) => {
//   res.redirect('/problem');
// })

// TESTING PORT
// .listen(8080);

const port = process.env.PORT || 1234;

app.listen(port, () => {
  console.log(`working on ${port}`);
});
