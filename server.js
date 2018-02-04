const express = require('express');
const session = require('cookie-session');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const pg = require('pg');

const app = express();

// COOKIES
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
.get('/db', function (request, response) {
  pg.connect(process.env.HEROKU_POSTGRESQL_MAROON_URL, function(err, client, done) {
    client.query('SELECT * FROM test_table', function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { response.render('pages/db', {results: result.rows} ); }
    });
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
