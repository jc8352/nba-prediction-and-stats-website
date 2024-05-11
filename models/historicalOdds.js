const mongoose = require('mongoose');

const dailyOdd = {
	date: {
		type: Date,
		required: true
	},
	odd: {
		type: Number,
		required: false
	},
	pct: {
		type: Number,
		required: false
	},
	projection: {
		type: Number,
		required: false
	}
};

const Participant = {
	participant: {
		type: String,
		required: true
	},
	participant_odds: [{
		type: dailyOdd
	}]
};

const HistoricalSchema = mongoose.Schema({
	take: {
		type: String,
		required: true
	},
	all_odds: [{
		type: Participant
	}]


});

const Historical = module.exports = mongoose.model('Historical', HistoricalSchema);

