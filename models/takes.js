const mongoose = require('mongoose');


const TakeSchema = mongoose.Schema({
	media_member: {
		type: String,
		required: true
	},
	affiliation: {
		type: String,
		default: "" 
	},
	take: {
		type: String,
		required: true
	},
	betting_odds: {
		type: Number,
		default: 0
	},
	link_to_take: {
		type: String,
		required: true
	},
	timestamp: {
		type: String,
		default: ""
	},
	result: {
		type: Boolean,
		required: false
	},
	inProgress: { //if !result) {inProgress = true;} //no result provided, take still in progress
		type: Boolean,
		required: true,
	},
	explanation: {
		type: String,
		default: "..."
	},
	date: {
		type: String,
		required: true
	}
});

const Take = module.exports = TakeSchema;
//const Take = module.exports = mongoose.model('Take', TakeSchema);









