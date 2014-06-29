
/**
 * controller to handle invites
 * @type {Object}
 */
var Invites={
	index:function(req, res){
     	 res.redirect('guests');
    },

    guests:function(req, res){
    	if(req.session.guest){
	    	req.db.guests.find().toArray(function(error, guests){
			    if (error) return next(error);
			    res.render('guests', {
			      active:function(page){return page=="guests"?"active":"";},
			      guests: guests || []
			    });
			  });
	    }else{
	    	res.send(403);
	    }
    },

    getInviteUrl:function(id){
    	return "http://localhost/affirmative/"+id;
    },

    affirmative:function(req, res, next){
    	if(req.session.guest){
	    	res.render('affirmative', 
	    		{active:function(page){return page=="affirmative"?"active":"";},
	    		guest:req.session.guest}
	    	);
	    }else{
	    	res.send(403);
	    }
    },

    invite:function(req, res, next){
    	if (!req.body || !req.body.name) return next(new Error('No data provided.'));
		  
		  req.db.guests.save({
		    name: req.body.name,
		    link: null,
		    affirmative: null
		  }, function(error, guest){
		    if (error) return next(error);
		    if (!guest) return next(new Error('Failed to save.'));
		    console.info('Added %s with id=%s', guest.name, guest._id);
		    
		    //create invitation link
		    req.db.guests.updateById(guest._id.toString(),
		    		{$set:{link:Invites.getInviteUrl(guest._id.toString())}},
		    	function(error, guest){
		    		if (error) return next(error);
		    		if (!guest) return next(new Error('Failed to update invitation link.'));
		    		res.redirect('/guests');
		    		console.info('Updated invitation link %s with id=%s', guest.name, guest._id);
		    	}
		    );
		  })

    },

    remove: function(req, res, next){
    	 req.db.guests.removeById(req.body.id, function(error, count) {
		    if (error) return next(error);
		    if (count !==1) return next(new Error('Something went wrong.'));
		    console.info('Deleted guest with id=%s completed.', req.body.id);
		    res.redirect('/guests');
		  });

    }
};


//public routes
exports.index=Invites.index;
exports.guests=Invites.guests;
exports.invite=Invites.invite;
exports.remove=Invites.remove;
exports.affirmative=Invites.affirmative;