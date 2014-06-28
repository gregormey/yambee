
/**
 * controller to handle invites
 * @type {Object}
 */
var Invites={
	index:function(req, res){
     	 res.redirect('guests');
    },
    guests:function(req, res){
    	res.render('guests');
    },

    invite:function(req, res){
    	
    }
};


//public routes
exports.index=Invites.index;
exports.guests=Invites.guests;