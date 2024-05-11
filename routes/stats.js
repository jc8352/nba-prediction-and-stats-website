const express = require('express');
const router = express.Router();

const Players = require('../models/players');
const Teams = require('../models/teams');

router.get('/', function(req, res) {
	Players.find({}, {game_logs: 0}, function(err, stats) {
		if (err) {
			res.send(err);
		}
		else {
			Teams.find({}, {game_logs: 0}, function(err, team_stats) {
				if (req.session.user) {
					res.render('stats', {all_players: stats, all_teams: team_stats, user: req.session.user});
				}
				else {
					res.render('stats', {all_players: stats, all_teams: team_stats, user: false});
				}
			});
		}
	});
});

router.get('/players/:playerid', function(req, res) {
	Players.findById({_id: req.params.playerid}, {game_logs: 0}, function(err, stats) {
		if (err) {
			res.send(err);
		}
		else {
			console.log(stats);
			Teams.findOne({name: stats.team}, {game_logs: 0}, function(err, team_stats) {
				if (req.session.user) {
					res.render('player_stats', {player: stats, team: team_stats, user: req.session.user});
				}
				else {
					res.render('player_stats', {player: stats, team: team_stats, user: false});
				}
			});
		}
	});
});

router.get('/teams/:teamname', function(req, res) {
	var team_name;
	if (req.params.teamname == "trailblazers") {
		team_name = "Trail Blazers";
	}
	else {
		team_name = req.params.teamname[0].toUpperCase()+req.params.teamname.slice(1);
	}
	Teams.findOne({name: team_name}, {game_logs: 0}, function(err, stats) {
		if (err) {
			res.send(err);
		}
		else {
			Players.find({team: team_name}, {game_logs: 0}, function(err, player_stats) {
				if (req.session.user) {
					res.render('team_stats', {team: stats, players: player_stats, user: req.session.user});
				}
				else {
					res.render('team_stats', {team: stats, players: player_stats, user: false});
				}
			});
			//console.log(stats);
		}
	});
});

router.get('/boxscores/:home/:away/:date', function(req, res) {
	if (req.session.user) {
		res.render('box_scores', {away: req.params.away, home: req.params.home, user: req.session.user});
	}
	else {
		res.render('box_scores', {away: req.params.away, home: req.params.home, user: false});
	}
});


module.exports = router;