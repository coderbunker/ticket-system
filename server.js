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
// .use((req, res, next) => {
//   if (typeof(req.session.tickets) == 'undefined') {
//     req.session.tickets = [];
//   }
//   next();
// })

client.connect();

// VIEW PROBLEM BUTTON
// TODO TURN INTO A BUTTON/LINK FOR THE INVENTORY SERVER
.get('/problem', (req, res) => {
  // res.render('problem.ejs', {tickets: req.session.tickets});
  res.render('problem.ejs');
})

// CREATE TICKET
.post('/problem/add/', urlencodedParser, (req, res) => {
  const now = new Date();
  // client.connect();
  client.query("INSERT INTO tickets (uuid, description, time) values ('A0EEBC99-9C0B-4EF8-BB6D-6BB9BD380A12', '" + req.body.newproblem + "', '" + now.toTimeString() + "')", (err, res) => {
    if (err) {
      console.error(err);
      response.send("Breaking thing... Error " + err);
    }
    // client.end();
  });
  res.redirect('/problem');
})

// READ TICKETS
.get('/tickets', (request, response) => {
  // client.connect();
  client.query('SELECT * FROM tickets', (err, res) => {
    if (err) {
      console.error(err);
      response.send("Not Good... Error " + err); }
    else {
      response.render('tickets.ejs', {tickets: res.rows});
    }
    // client.end();
  });
})

// UPDATE TICKET DETAILS
.get('/tickets/update/:id', (req, res) => {
  req.session.tickets[req.params.id].update ? req.session.tickets[req.params.id].update = false : req.session.tickets[req.params.id].update = true;
  res.redirect('/tickets');
})

// DELETE TICKET

// .get('/tickets/delete/:id', (req, res) => {
//   if (req.params.id != '') {
//     req.session.tickets.splice(req.params.id, 1);
//   }
//   res.redirect('/tickets');
// })

.get('/tickets/delete/:id', (req, res) => {
  let id = req.params.id;
  // client.connect();
  client.query("DELETE FROM customer WHERE id = ? ",[id], function(err, rows){
    if(err){
      console.log("Error deleting : %s ", err );
      res.send("Not Good... Error " + err);
    }
    // client.end();
  });
  // MAYBE DELETE THIS TO TEST
  res.redirect('/tickets');
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
