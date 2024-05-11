const mongoose = require('mongoose');
const Take = require('../models/takes');

const MediaMemberSchema = mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	affiliation: {
		type: String,
		required: true
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
	pfp: {
		type: String,
		default: "defaultpfp.jpeg"
	},
	takes: [{
		type: Take
	}]
});

const MediaMember = module.exports = mongoose.model('MediaMember', MediaMemberSchema);





