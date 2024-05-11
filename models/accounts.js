const mongoose = require('mongoose');
const UserTake = require('../models/usertakes');
const bcrypt = require("bcryptjs");

const Game = {
	gameID: {
		type: Number,
		required: true
	},
	opponent: {
		type: String,
		required: true
	},
	win: {
		type: Number,
		required: true
	},
	ratingGain: {
		type: Number,
		required: true
	}
}

const UserSchema = mongoose.Schema({
	email: {
		type: String
	},
	username: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	group: {
		type: String,
		required: false
	},
	total_takes: {
		type: Number,
		default: 0
	},
	right: {
		type: Number,
		default: 0
	},
	wrong: {
		type: Number,
		default: 0
	},
	tt_pct: {
		type: Number,
		default: 0
	},
	money_gain: {
		type: Number,
		default: 0
	},
	wagered: {
		type: Number,
		default: 0
	},
	pct_gain: {
		type: Number,
		default: 0
	},
	stock_price: {
		type: Number,
		default: 5.00
	},
	followers: {
		type: Number,
		default: 0
	},
	following: {
		type: Number,
		default: 0
	},
	pfp: {
		type: String,
		default: "defaultpfp.jpeg"
	},
	takes: [{
		type: UserTake
	}],
	h2h: [{
		type: Game
	}],
	take_reset_date: {
		type: Date,
		required: true
	}
});


UserSchema.pre("save", function (next) {
  const user = this;

	if (this.isModified("password") || this.isNew) {
		bcrypt.genSalt(10, function (saltError, salt) {
    		if (saltError) {
        		return next(saltError);
      		} 
      		else {
        		bcrypt.hash(user.password, salt, function(hashError, hash) {
	          		if (hashError) {
	            		return next(hashError);
	          		}
	          		user.password = hash;
	          		next();
	        	});
      		}
    	});
  	} 
  	else {
    	return next()
  	}
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

const User = module.exports = mongoose.model('User', UserSchema);





