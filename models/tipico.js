const mongoose = require('mongoose');

const Participant = mongoose.Schema({
	id: {
		type: Number
	},
	name: {
		type: String
	},
	position: {
		type: String
	}
})

const TipicoSchema = mongoose.Schema({
	event_date: {
		type: Date,
		required: false
	},
	event_type: {
		type: String,
		required: true
	},
	category: {
		type: String,
		required: false
	},
	homeTeam: {
		type: String,
		required: false
	},
	awayTeam: {
		type: String,
		required: false
	},
	outcome: {
		type: String,
		required: false
	},
	coveringTeam: {
		type: String,
		required: false
	},
	spread: {
		type: Number,
		required: false
	},
	description: {
		type: String,
		required: true
	},
	odds: {
		type: Number,
		required: true
	},
	length: {
		type: String,
		required: false
	},
	specifier: {
		type: String,
		required: false
	}

});


const Tipico = module.exports = mongoose.model("tipico", TipicoSchema);

