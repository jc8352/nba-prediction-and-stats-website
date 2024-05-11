const mongoose = require('mongoose');
const Tipico = require('../models/tipico');

const UserTakeSchema = mongoose.Schema({
	take: {
		type: Tipico.schema,
		required: true
	},
	result: {
		type: String,
		default: "A" //"W", "L", "D" options
	},
	//inProgress: { //if !result) {inProgress = true;} //no result provided, take still in progress
	//	type: Boolean,
	//	required: true,
	//},
	explanation: {
		type: String,
		default: "..." //get score for individual games
	},
	date: {
		type: Date,
		required: true
	},
	take_gain: {
		type: Number,
		required: false
	}
});

const UserTake = module.exports = UserTakeSchema;