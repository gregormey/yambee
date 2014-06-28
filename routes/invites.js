
/**
 * controller to handle invites
 * @type {Object}
 */
var Invites={
	index:function(req, res){
     	 res.redirect('guests');
    },

    guests:function(req, res){
    	req.db.guests.find().toArray(function(error, guests){
		    if (error) return next(error);
		    res.render('guests', {
		      guests: guests || []
		    });
		  });
    },

    getInviteUrl:function(name){
    	return "http://hochzeit.gregormeyenberg.de/"+name;
    },

    invite:function(req, res){
    	if (!req.body || !req.body.name) return next(new Error('No data provided.'));
		  
		  req.db.guests.save({
		    name: req.body.name,
		    link: Invites.getInviteUrl(req.body.name),
		    affirmative: null
		  }, function(error, guest){
		    if (error) return next(error);
		    if (!guest) return next(new Error('Failed to save.'));
		    console.info('Added %s with id=%s', guest.name, guest._id);
		    res.redirect('/guest');
		  })

    }
};


//public routes
exports.index=Invites.index;
exports.guests=Invites.guests;
exports.invite=Invites.invite;