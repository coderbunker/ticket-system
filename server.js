const express = require('express');
const session = require('cookie-session');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const pg = require('pg');
const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool();
const { Client } = require('pg');
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
.get('/problem', (req, res) => {
  res.render('problem.ejs', {tickets: req.session.tickets});
})

// VIEW TICKETS
.get('/tickets', (req, res) => {
  res.render('tickets.ejs', {tickets: req.session.tickets});
})

// ADD TICKET
.post('/problem/add/', urlencodedParser, (req, res) => {
  const now = new Date();
  if (req.body.newproblem == '') {
    req.session.tickets.push({time: now.toTimeString(), problem: 'No description.', update: false });
  }else{
    req.session.tickets.push({time: now.toTimeString(), problem: req.body.newproblem, update: false });
  }
  res.redirect('/problem');
})

// DELETE TICKET
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
  client.query('SELECT * FROM test_table', (err, res) => {
    // if (err) throw err;
    // for (let row of res.rows) {
    //   console.log('FART: ', JSON.stringify(row));
    // }
    if (err) {
      console.error(err);
      response.send("Not Good: Error " + err); }
    else {
      console.log('HEY LOOK HERE');
      // TODO names of vars is a bit off for the template...to fix
      // console.log('RESPONSE', res.rows);
      // console.log('RESPONSE', res.rows[1]);
      // console.log('RESPONSE', res.rows[1].name);
      res.render('database.ejs', {results: res.rows});
    }
    client.end();
  });

  // pool.connect(connectionString, function(err, client, done) {
  //   client.query('SELECT * FROM test_table', function(err, result) {
  //     done();
  //     if (err)
  //      { console.error(err); response.send("Burp Error " + err); }
  //     else
  //      { response.render('pages/db', {results: result.rows} ); }
  //   });
  // });
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
