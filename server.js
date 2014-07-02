var express = require('express')
  , swig = require('swig')
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , session = require('cookie-session')
  , vhost = require('vhost')
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

//identification routs
app.get('/guests/:guest_id', invites.guests);
app.get('/affirmative/:guest_id', invites.affirmative);

//init guest if id is given
app.param('guest_id', function(req, res, next, guestId) {
  req.db.guests.findById(guestId, function(error, guest){
    if (error) return next(error);
    if (!guest){
      console.info("Guest not found");
      res.send(403).end();
    }else{
      console.info("found guest "+guest.name);
      req.session.guest = guest;
      return next();
    }
  });
});


//deny acces if it is no valid guest
app.use(function(req, res, next){
  if(!req.session.guest && !req.params.guest_id){
    res.send(403).end();
  }else{
    next();
  }
});



/**
 * route configuration
 */
app.get('/', invites.info);
app.get('/guests', invites.guests);
app.post('/invite', invites.invite);
app.post('/remove', invites.remove);
app.get('/affirmative', invites.affirmative);
app.get('/agree', invites.agree);
app.get('/refuse', invites.refuse);
app.get('/info', invites.info);



//register app on a vhost if given
if(!process.argv[2]){
/**
  * Start server
  */
  app.listen(80);
  console.log('yambee Server listening port 80');
}else{
  var vhostapp=express();
  var vhostname=process.argv[2];
  vhostapp.use(vhost(vhostname, app));
  vhostapp.listen(80);
  console.log('yambee Server listening port 80 on vhost '+ vhostname);
}

//show Admin link
db.collection('guests').findOne({"name":"Gregor"},
  function(error,guest){
    if (error) return next(error);
    if (guest){
      console.info("Admin access:"+guest.link);
    }else{
      console.info("No admin created");
    }
});



