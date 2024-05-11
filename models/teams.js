const mongoose = require('mongoose');

const Game = {
	game_date: {
		type: Date,
		required: true
	},
	opponent: {
		type: String,
		required: true
	},
	location: {
		type: String, //"H"-home, "A"-away, "N"-neutral (mexico city games)
		required: true
	},
	points: {
		type: Number,
		required: true
	},
	fgm: {
		type: Number,
		required: true
	},
	fga: {
		type: Number,
		required: true
	},
	tpm: {
		type: Number,
		required: true
	},
	tpa: {
		type: Number,
		required: true
	},
	ftm: {
		type: Number,
		required: true
	},
	fta: {
		type: Number,
		required: true
	},
	assists: {
		type: Number,
		required: true
	},
	rebounds: {
		type: Number,
		required: true
	},
	TOs: {
		type: Number,
		required: true
	},
	point_differential: {
		type: Number,
		required: true
	},
	techs: {
		type: Number,
		required: true
	},
	ots: {
		type: Number,
		default: 0
	},
	win: {
		type: Boolean,
		required: true
	}

}

const TeamsSchema = {
	name: {
		type: String,
		required: true
	},
	games_played: {
		type: Number,
		required: true
	},
	total_points: {
		type: Number,
		required: true
	},
	total_assists: {
		type: Number,
		required: true
	},
	total_rebounds: {
		type: Number,
		required: true
	},
	total_fgm: {
		type: Number,
		required: true
	},
	total_fga: {
		type: Number,
		required: true
	},
	total_3sM: {
		type: Number,
		required: true
	},
	total_3sA: {
		type: Number,
		required: true
	},
	total_ftm: {
		type: Number,
		required: true
	},
	total_fta: {
		type: Number,
		required: true
	},
	total_TOs: {
		type: Number,
		required: true
	},
	total_point_differential: {
		type: Number,
		required: true
	},
	total_techs: {
		type: Number,
		required: true
	},
	total_wins: {
		type: Number,
		required: true
	},
	total_ots: {
		type: Number,
		default: 0
	},
	game_logs: [{
		type: Game
	}] 
}

const Teams = module.exports = mongoose.model('Teams', TeamsSchema);

