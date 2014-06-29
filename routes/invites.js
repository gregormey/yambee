
/**
 * controller to handle invites
 * @type {Object}
 */
var Invites={
	index:function(req, res){
     	 res.redirect('guests');
    },

    guests:function(req, res){
    		var guests=false;
    		var invites=false;
    		var aggrees=false;
    		var refuses=false;

    		var render=function(){
    			
			   	if(invites!==false && 
			   		guests!==false && 
			   		aggrees!==false && 
			   		refuses!==false){
						res.render('guests', {
				      		active:function(page){return page=="guests"?"active":"";},
				      		guests: guests,
				      		invites:invites,
				      		aggrees:aggrees,
				      		refuses:refuses
				    	});
				}
			};

    		//collect guests
	    	req.db.guests.find().toArray(function(error, guestsList){
			    if (error) return next(error);guestsList
			    guests=guestsList||[];	
			    render();
			  });

	    	//count invites
			req.db.guests.count(function(error, count){
			    if (error) return next(error);
			    invites=count;
			    render();	
			  });	    	

			//count aggrees
			req.db.guests.count({affirmative:1},function(error, count){
			    if (error) return next(error);
			    aggrees=count;
			    render();	
			  });

			//count refuses
			req.db.guests.count({affirmative:0},function(error, count){
			    if (error) return next(error);
			    refuses=count;
			    render();	
			  });


	    	

    },

    updateAffirmative:function(value,req, res){
    	req.db.guests.updateById(req.session.guest._id.toString(),
		    		{$set:{affirmative:value}},
		    	function(error, count){
		    		if (error) return next(error);
		    		
		    		req.db.guests.findById(req.session.guest._id,function(error,guest)
		    			{
		    				 if (error) return next(error);
		    				 req.session.guest=guest;
		    				res.redirect('/guests');
		    				console.info('Updated affirmative %s with id=%s to %s', guest.name, guest._id, value);
		    			}
		    		);
		    		
		    	}
		    );
    },

    agree:function(req, res){
    	Invites.updateAffirmative(1,req, res);
    },

    refuse:function(req, res){
    	Invites.updateAffirmative(0,req, res);
    },

    getInviteUrl:function(id){
    	return "http://localhost/affirmative/"+id;
    },

    affirmative:function(req, res, next){
    		console.info(req.session.guest.affirmative);
	    	res.render('affirmative', 
	    		{active:function(page){return page=="affirmative"?"active":"";},
	    		guest:req.session.guest}
	    	);
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
exports.agree=Invites.agree;
exports.refuse=Invites.refuse;
