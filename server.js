var express = require('express')
  , swig = require('swig')
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , session = require('cookie-session')
  , app = express();

var invites = require('./routes/invites');

var mongoskin = require('mongoskin');
// init mongodb stuff
var db = mongoskin.db('mongodb://localhost:27017/guests?auto_reconnect', {safe:true});

app.use(function(req, res, next) {
  req.db = {};
  req.db.guests = db.collection('guests');
  next();
});

//enable session session
 app.use(session({secret:"american nails"}));

  // assign the swig engine to .html files
app.engine('html', swig.renderFile);


// set .html as the default extension 
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

//GET public assets
app.use(express.static(__dirname + '/public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended:true}));

//init guest if id is given
app.param('guest_id', function(req, res, next, guestId) {
  req.db.guests.findById(guestId, function(error, guest){
    if (error) return next(error);
    if (!guest) return next(new Error('Guest is not found.'));
    console.info("found guest "+guest.name);
    req.session.guest = guest;
    return next();
  });
});



/**
 * route configuration
 */
app.get('/', invites.index);
app.get('/guests', invites.guests);
app.get('/guests/:guest_id', invites.guests);
app.post('/invite', invites.invite);
app.post('/remove', invites.remove);
app.get('/affirmative/:guest_id', invites.affirmative);
app.get('/affirmative', invites.affirmative);

/**
 * Start server
 */
app.listen(80);
console.log('yambee Server listening port 80');