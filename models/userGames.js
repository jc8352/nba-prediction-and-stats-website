const mongoose = require('mongoose');
const UserTake = require('../models/usertakes');

const Player = {
	username: {
		type: String,
		required: true
	},
	score: {
		type: Number,
		required: true,
		default: 0
	},
	rating: {
		type: Number,
		required: true
	},
	takes: [{
		type: UserTake
	}],
}

const GameSchema = mongoose.Schema({
	gameID: {
		type: Number,
		required: true
	},
	player1: {
		type: Player,
		required: true
	},
	player2: {
		type: Player,
		required: true
	},
	numtakes: {
		type: String,
		required: true
	},
	inProgress: {
		type: Boolean,
		required: true,
		default: true
	},
	winner: {
		type: String,
		required: true,
		default: "TBD"
	},
	date: {
		type: Date,
		required: true
	},
	length: {
		type: String,
		required: true
	}
})

const UserGames = module.exports = mongoose.model('UserGames', GameSchema);

