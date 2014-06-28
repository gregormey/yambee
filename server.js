var express = require('express')
  , swig = require('swig')
  , app = express();

var invites = require('./routes/invites');

var mongoskin = require('mongoskin');
// init mongodb stuff
var db = mongoskin.db('mongodb://localhost:27017/guests?auto_reconnect', {safe:true});

app.use(function(req, res, next) {
  req.db = {};
  req.db.guests = db.collection('guests');
  next();
})

  // assign the swig engine to .html files
app.engine('html', swig.renderFile);


// set .html as the default extension 
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

//GET public assets
app.use(express.static(__dirname + '/public'));

/**
 * route configuration
 */
app.get('/', invites.index);
app.get('/guests', invites.guests);
app.post('/invite', invites.invite);

/**
 * Start server
 */
app.listen(80);
console.log('yambee Server listening port 80');