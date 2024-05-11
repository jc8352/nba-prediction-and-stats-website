const mongoose = require('mongoose');

const Player = {
	name: {
		type: String,
		required: true
	},
	starter: {
		type: Boolean,
		required: true
	},
	mins: {
		type: Number,
		required: true
	},
	secs: {
		type: Number,
		required: true
	},
	points: {
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
	oreb: {
		type: Number,
		required: true
	},
	dreb: {
		type: Number,
		required: true
	},
	blocks: {
		type: Number,
		required: true
	},
	steals: {
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
	fouls: {
		type: Number,
		required: true
	},
	turnovers: {
		type: Number,
		required: true
	},
	plus_minus: {
		type: Number,
		required: true
	},
	technicals: {
		type: Number,
		required: true
	},
}

const Game = {
	game_date: {
		type: Date,
		required: true
	},
	seasonType: {
		type: Number,
		required: true
	},
	attendance: {
		type: Number,
		required: true
	},
	location: {
		type: String,
		required: true
	},
	currentWins: {
		type: Number,
		required: false
	},
	currentLosses: {
		type: Number,
		required: false
	},
	opponent: {
		type: String,
		required: true
	},
	point_differential: {
		type: Number,
		required: true
	},
	win: {
		type: Number,
		required: true
	},
	points: {
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
	oreb: {
		type: Number,
		required: true
	},
	dreb: {
		type: Number,
		required: true
	},
	q1Score: {
		type: Number,
		required: true
	},
	q2Score: {
		type: Number,
		required: true
	},
	q3Score: {
		type: Number,
		required: true
	},
	q4Score: {
		type: Number,
		required: true
	},
	overtimes: {
		type: Number,
		required: true
	},
	paintPoints: {
		type: Number,
		required: true
	},
	fastBreakPoints: {
		type: Number,
		required: true
	},
	pointsOffTurnovers: {
		type: Number,
		required: true
	},
	blocks: {
		type: Number,
		required: true
	},
	steals: {
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
	turnovers: {
		type: Number,
		required: true
	},
	fouls: {
		type: Number,
		required: true
	},
	techincals: {
		type: Number,
		required: true
	},
	flagrants: {
		type: Number,
		required: true
	},
	ejections: {
		type: Number,
		required: true
	},
	players: [{
		type: Player
	}]

}

const BoxScoresSchema = {
	team: {
		type: String,
		required: true
	},
	season: {
		type: String,
		required: true
	},
	currentWins: {
		type: Number,
		required: true
	},
	currentLosses: {
		type: Number,
		required: true
	},
	box_scores: [{
		type: Game
	}]
}

const BoxScores = module.exports = mongoose.model('BoxScores', BoxScoresSchema);