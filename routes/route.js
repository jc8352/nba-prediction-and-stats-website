const express = require('express');
const router = express.Router();

const Take = require('../models/takes');
const MediaMember = require('../models/mediamembers');
const Tipico = require('../models/tipico');
const UserTakes = require('../models/usertakes');
const User = require('../models/accounts');
const HistoricalOdds = require('../models/historicalOdds');
const FollowLists = require('../models/followers');
const Players = require('../models/players');
const Teams = require('../models/teams');
const BoxScores = require('../models/boxScores');
const UserGames = require('../models/userGames');

const fs = require('fs');
const multer = require('multer');
const uuid = require('uuid').v4;
const axios = require('axios');
//const bcrypt = require('bcryptjs');


const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "public/pfp_images");
	},
	filename: (req, file, cb) => {
		//console.log(file);
		const { originalname } = file;
		cb(null, uuid()+'-'+originalname);
	}
});
const upload = multer({ storage });

router.get('/mediapfp/:apikey', function(req, res) {
	if (req.params.apikey == process.env.API_KEY) {
		MediaMember.find({}, {name: 1}, function(err, media_members) {
			if (err) {
				res.json(err);
			}
			else {
				res.render('db_access', {info: media_members});
			}
		});
	}
	else {
		res.send("Access Denied");
	}
});

router.post('/uploadImage/', upload.single('pfp'), function(req, res, next) {
	MediaMember.findOneAndUpdate({_id: req.body.id}, {pfp: req.file.filename}, function(err, result) {
		if (err) {
			res.json(err);
		}
		else {
			console.log("pfp updated successfully");
			res.end();
		}
	});
});

//retrieving takes
router.get('/takes', function(req, res, next) {
	MediaMember.find(function(err, media_members) {
		if (err) {
			res.json(err);
		}
		else {
			media_members.forEach(function(item) {
				var media_takes = item.takes;
				for (i = 0; i < media_takes.length; i++) {
					res.write("Take id: " + media_takes[i]._id + "\n");
					res.write("Take: " + media_takes[i].take + "\n");
					res.write("Media Member: " + media_takes[i].media_member + "\n");
					res.write("Affiliation: " + media_takes[i].affiliation + "\n");
					res.write("Betting odds: " + media_takes[i].betting_odds + "\n");
					res.write("Link to take: " + media_takes[i].link_to_take + "\n");
					res.write("Timestamp (if any): " + media_takes[i].timestamp + "\n");
					res.write("Result: " + media_takes[i].result + "\n");
					res.write("In progress: " + media_takes[i].inProgress + "\n");
					res.write("Explanation: " + media_takes[i].explanation + "\n");
					res.write("Date: " + media_takes[i].date + "\n");
					res.write("\n");

				}
			});
			res.end();
		}
	});
});

router.get('/mediamembers', function(req, res, next) {
	MediaMember.find(function(err, media_members) {
		res.json(media_members);
	});
});

//add media member's takes
router.post('/media/newtake/:apikey', function(req, res, next) {
	//logic to add takes
	if (req.params.apikey == process.env.API_KEY) {
		let newTake = {
			media_member: req.body.media_member,
			affiliation: req.body.affiliation,
			take: req.body.take,
			betting_odds: req.body.betting_odds,
			link_to_take: req.body.link_to_take,
			timestamp: req.body.timestamp,
			result: req.body.result,
			explanation: req.body.explanation,
			date: req.body.date,
			inProgress: req.body.inProgress
		};

		const BET_VALUE = 50;
		var correct = (req.body.result) ? 1:0;
		if (req.body.betting_odds) { //check if there's a betting odd in request
			if (req.body.betting_odds < 0) { //if there is, calculate money gained on $50 bet
				var money_gained = (1/(-1*req.body.betting_odds/100)+1)*BET_VALUE*correct - BET_VALUE;
			}
			else if (req.body.betting_odds == 0) {
				var money_gained = 0;
			}
			else {
				var money_gained = BET_VALUE*(req.body.betting_odds/100+1)*correct-BET_VALUE;
			}
		}
		else { //set money gained to 0 if no betting odd
			var money_gained = 0;
		}

		//if media member with name in request doesn't exist, create new MediaMember and save
		MediaMember.exists({name: req.body.media_member}, function(err, doc) {
			if (!doc) {
				//let takes_array = [];
				//takes_array.push(newTake);
				if (req.body.inProgress) {
					var newMediaMember = new MediaMember({
					name: req.body.media_member,
					affiliation: req.body.affiliation,
					total_takes: 1,
					right: 0,
					wrong: 0,
					money_gain: 0,
					takes: newTake
					});
				}
				else {
					var newMediaMember = new MediaMember({
					name: req.body.media_member,
					affiliation: req.body.affiliation,
					total_takes: 1,
					right: correct,
					wrong: 1-correct,
					money_gain: money_gained,
					takes: newTake,
					wagered: 50,
					tt_pct: correct,
					pct_gain: money_gained/50
					});
				}
				newMediaMember.save(function(err, member) {
					if (err) {
						res.json({msg: 'Failed to add take'});
					}
					else {
						res.json({msg: 'Take added successfully'});
					}
				});
			}
			else { //else update existing MediaMember
				if (req.body.inProgress) {
					MediaMember.findOneAndUpdate({name: req.body.media_member},
						{$inc: 
							{
								total_takes: 1
							},
						$push:
							{
								takes: newTake
							}}, function(err, member) {
						if (err) {
							res.json({msg: 'Failed to add take'});
						}
						else {
							res.json({msg: 'Take added successfully'});
						}
					});
				}
				else {
					MediaMember.findOneAndUpdate({name: req.body.media_member},
						{$inc: 
							{
								total_takes: 1,
								right: correct,
								wrong: 1-correct,
								money_gain: money_gained,
								wagered: 50
							},
						$push:
							{
								takes: newTake
							}}, function(err, member) {
						if (err) {
							res.json({msg: 'Failed to add take'});
						}
						else {
							MediaMember.findOneAndUpdate({name: req.body.media_member}, 
								[{$set: {tt_pct: {$divide: ["$right", {$add: ["$right", "$wrong"]}]}, 
								pct_gain: {$divide: ["$money_gain", "$wagered"]}}}], function(err, member) {
									if (err) {
										res.json({msg: 'failed to update ttpct and pctgain'});
									}
									else {
										res.json({msg: 'Take added successfully'});
									}
							});
						}
					});
				}
			}
		});
	}
	else {
		res.send("Access Denied");
	}


});

router.post('/createAccount', upload.none(), function(req, res, next) {
	User.exists({username: req.body.username}, function(err, doc) {
		if (doc) {
			res.send('username already taken');
		}
		else {
			var newUser = new User({
				email: req.body.email,
				username: req.body.username,
				password: req.body.password,
				take_reset_date: new Date()
			});
			newUser.save(function(err, result) {
				if (err) {
					res.json(err);
				}
				else {
					req.session.user = {username: req.body.username, id: result._id};
					res.json({msg: "new account created successfully"});
					var followList = new FollowLists({
						user: req.body.username,
						_id: result._id
					});
					followList.save(function(err, result) {
						if (err) {console.log(err)}
						else {console.log("new follow lists created successfully");}
					});
				}
			});
		}
	});
});

router.post('/login', upload.none(), function(req, res, next) {
	User.findOne({username: req.body.username}, function(err, item) {
		if (item) {
			item.comparePassword(req.body.password, function(err, result) {
				if (result) {
					req.session.user = {username: req.body.username, id: item._id};
					//res.redirect('/');
					res.send('valid login');
				}
				else {
					res.send('password incorrect');
				}
			});
		}
		else {
			res.send("user doesn't exist");
			//res.redirect('/login');
		}
	});
});

router.get('/users', function(req, res) {
	User.find(function(err, users) {
		res.json(users);
	});
});

router.put('/users/takes/all/clear', function(req, res) {
	let now = new Date();
	let next_reset = new Date();
	next_reset.setDate(next_reset.getDate()+14);
	console.log(now);
	console.log(next_reset);
	User.findOneAndUpdate({_id: req.session.user.id, take_reset_date: {$lte: now}}, {$set: {takes: [], total_takes: 0, right: 0, wrong: 0, money_gain: 0, tt_pct: 0, wagered: 0, pct_gain: 0, take_reset_date: next_reset}}, function(err, result) {
		if (result == null) {
			res.json({msg: "couldn't clear"});
		}
		else {
			res.json({msg: "process completed"});
		}
	});
});

router.post('/users/set/followlists/:apikey', function(req, res) {
	if (req.params.apikey == process.env.API_KEY) {
		User.find(function(err, users) {
			users.forEach(function(user) {
				var followList = new FollowLists({
					user: user.username,
					_id: user._id
				});
				followList.save(function(err, result) {
					if (err) {console.log(err)}
					else {console.log("new follow lists created successfully");}
				})
			});
		})
	}
	else {
		res.send("Access Denied");
	}
});

router.get('/users/get/followlists', function(req, res) {
	FollowLists.find(function(err, followLists) {
		res.json(followLists);
	});
})

router.get('/usernames/:input', function(req, res) {
	User.find({username: {$regex: req.params.input}}, {username: 1, _id: 1}).limit(10).exec(function(err, usernames) {
		res.json(usernames);
	})
});

router.get('/gettakes/:input', function(req, res) {
	Tipico.find({description: {$regex: req.params.input, $options: 'i'}}, {description: 1, _id: 1, event_date: 1, length: 1}, function(err, takes) {
		res.json(takes);
	})
});

router.post('/usertake', upload.none(), function(req, res) {
	var take_date;
	const AWS_UTC_SHIFT = 4;
	var curr_time = new Date();
	//curr_time.setHours(curr_time.getHours()-AWS_UTC_SHIFT);
	Tipico.findOne({description: req.body.new_take}, function(err, new_take) {
		console.log(new_take);
		if (new_take == null) {res.send("take not found");}
		else if ((new Date(new_take.event_date)).getTime() < curr_time.getTime()) {
			res.send("too late, past game time");
		}
		else {
			take_date = new Date();
			//take_date.setHours(take_date.getHours()-AWS_UTC_SHIFT);
			User.findOneAndUpdate({_id: req.session.user.id, "takes.take.description": {$nin: [req.body.new_take]}},
				{$inc: {total_takes: 1},
				 $push: {takes: {take: new_take,
								date: take_date}}
				}, function(err, result) {
					if (err) {
						res.json(err);
					}
					else {
						if (result == null) {
							res.send("duplicate");
						}
						else {
							console.log('reaching proper statement');
							res.send(req.session.user.id);
						}
					}
				});
		}
	});
	//console.log(req.body);
});

function getGain(odds) {
	const BET_VALUE = 50;
	if (odds > 0) {
		return BET_VALUE*(odds/100+1)-BET_VALUE;
	}
	else if (odds < 0) {
		return (1/(-1*odds/100)+1)*BET_VALUE - BET_VALUE;
	}
	else {
		return 0;
	}
}

router.get('/users/update/:apikey', function(req, res, next) {
	if (req.params.apikey == process.env.API_KEY) {
		console.log(updatedGames);
		const AWS_UTC_SHIFT = 4;
		const EST_SHIFT = 3;
		var today = new Date();
		today.setHours(today.getHours()-(AWS_UTC_SHIFT+EST_SHIFT));
		game_date_str = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
		(async () => {
			try {
				console.log('https://uk.global.nba.com/stats2/scores/daily.json?countryCode=US&gameDate=' + game_date_str + '&locale=en&tz=-5');
				const response = await axios('https://uk.global.nba.com/stats2/scores/daily.json?countryCode=US&gameDate=' + game_date_str + '&locale=en&tz=-5');
				var scores = response.data;
				if (scores.payload.date == null) {var games = [];}
				else {var games = scores.payload.date.games;}
				var homeTeam, awayTeam, winner, loser, winning_score, losing_score, win_str, lose_str;
				var update, game_date, winning_spread, losing_spread;
				console.log("got games");
				console.log(games.length);
				for (i = 0; i < games.length; i++) {
					if (games[i].boxscore.statusDesc == "Final" && updatedGames.filter(e => e.home == games[i].homeTeam.profile.name && e.away == games[i].awayTeam.profile.name && e.date == games[i].profile.dateTimeEt).length == 0) {
						homeTeam = games[i].homeTeam.profile.name;
						console.log(homeTeam);
						awayTeam = games[i].awayTeam.profile.name;
						console.log(awayTeam);

						winner = (games[i].boxscore.awayScore > games[i].boxscore.homeScore) ? awayTeam : homeTeam;
						loser = (games[i].boxscore.awayScore > games[i].boxscore.homeScore) ? homeTeam : awayTeam;
						if (games[i].boxscore.awayScore > games[i].boxscore.homeScore) {
							winning_score = games[i].boxscore.awayScore;
							losing_score = games[i].boxscore.homeScore;
						}
						else {
							winning_score = games[i].boxscore.homeScore;
							losing_score = games[i].boxscore.awayScore;
						}
						console.log("Winner: " + winner);
						game_date = new Date(parseInt(games[i].profile.utcMillis));
						//game_date.setHours(game_date.getHours()-7);
						console.log("game date: " + game_date);
						losing_spread = winning_score-losing_score;
						winning_spread = losing_score-winning_score;
						console.log("spread: "+ losing_spread);
						win_str = "The " + winner + " beat the " + loser + " " + winning_score + "-" + losing_score;
						lose_str = "The " + loser + " lost to the " + winner + " " + winning_score + "-" + losing_score;
						update = await User.updateMany(
							{takes: {$elemMatch: {"take.homeTeam": homeTeam, "take.awayTeam": awayTeam, result: "A", "take.event_date": game_date}}},
							[ 
								{$set:
								 	{takes:
								 	 	{$map:
								 	 		{input: 
								 	 			"$takes",
								 	 			in: 
								 	 				{$mergeObjects: [
								 	 					"$$this",
									 	 					{$cond: [
									 	 						{$and: [
									 	 					 		{$eq: ["$$this.take.homeTeam",homeTeam]}, /*homeTeam*/
									 	 					 		{$eq: ["$$this.take.awayTeam",awayTeam]}, /*awayTeam*/
									 	 					 		{$eq: ["$$this.result", "A"]},
									 	 					 		{$eq: ["$$this.take.event_date", game_date]} /*game_date-4 hours*/
									 	 					 	]}
									 	 					 ,
									 	 					{$switch: {branches: [{case: {$and: [{$eq: ["$$this.take.coveringTeam", winner]}, {$gt: ["$$this.take.spread", winning_spread]}]}, then: {result: "W", explanation: win_str, take_gain: {$switch: {branches: [{case: {$gt: ["$$this.take.odds", 0]}, then: {$multiply: [{$divide: ["$$this.take.odds", 100]}, 50]}}], default: {$multiply: [{$divide: [-100, "$$this.take.odds"]}, 50]}}}}},
											  {case: {$and: [{$eq: ["$$this.take.coveringTeam", loser]}, {$gt: ["$$this.take.spread", losing_spread]}]}, then: {result: "W", explanation: win_str, take_gain: {$switch: {branches: [{case: {$gt: ["$$this.take.odds", 0]}, then: {$multiply: [{$divide: ["$$this.take.odds", 100]}, 50]}}], default: {$multiply: [{$divide: [-100, "$$this.take.odds"]}, 50]}}}}},
											  {case: {$and: [{$eq: ["$$this.take.event_type", "Moneyline"]}, {$eq: ["$$this.take.outcome", winner]}]}, then: {result: "W", explanation: win_str, take_gain: {$switch: {branches: [{case: {$gt: ["$$this.take.odds", 0]}, then: {$multiply: [{$divide: ["$$this.take.odds", 100]}, 50]}}], default: {$multiply: [{$divide: [-100, "$$this.take.odds"]}, 50]}}}}}
											  ], default: {result: "L", explanation: lose_str, take_gain: -50}
											}}
									 	 					,null
									 	 					]}	
								 	 				]},
								 	 		}
								 	 	}
								 	}
								},
								{$set:
									{right: {$size: {$filter: {input: "$takes", cond: {$eq: ["$$this.result", "W"]}}}},
									 wrong: {$size: {$filter: {input: "$takes", cond: {$eq: ["$$this.result", "L"]}}}},
									 money_gain: {$sum: "$takes.take_gain"}}
								},
								{$set:
									{/*total_takes: {$add: ["$right", "$wrong"]},*/
									 tt_pct: {$cond: [{$and: [{$eq: ["$right", 0]}, {$eq: ["$wrong", 0]}]}, 0, {$divide: ["$right", {$add: ["$right", "$wrong"]}]}]}}
								},
								{$set:
									{wagered: {$multiply: [{$add: ["$right", "$wrong"]}, 50]}}
								},
								{$set:
									{pct_gain: {$cond: [{$and: [{$eq: ["$right", 0]}, {$eq: ["$wrong", 0]}]}, 0, {$divide: ["$money_gain", "$wagered"]}]}}
								}
							])
						updatedGames.push({"home": games[i].homeTeam.profile.name, "away": games[i].awayTeam.profile.name, "date": games[i].profile.dateTimeEt});
					}
				}
				console.log(updatedGames);

				console.log("pct_gain + tt_pct update: "+ update);
				res.send(games);
			} catch(err) {
				console.log(err);
			}
		}) ();
	}
	else {
		res.send("Access Denied");
	}
});

router.put('/decrement/:apikey', function(req, res) {
	if (req.params.apikey == process.env.API_KEY) {
		User.updateMany({username: "jc8352"}, {$inc: {right:-1}}, function(err, result) {

		})
		User.updateMany({username: "test11"}, {$inc: {wrong:-1}}, function(err, result) {

		})
	}
	else {
		res.send("Access Denied");
	}
})

router.delete('/usertake/delete/:username/:takeid/:apikey', function(req, res) {
	if (req.params.apikey == process.env.API_KEY) {
		User.find({username: req.params.username}, function(err, result) {
			let takes_array = result[0].takes;
			for (i = 0; i < takes_array.length; i++) {
				if (takes_array[i]._id == req.params.takeid) {
					User.findOneAndUpdate({username: req.params.username},
						{$pullAll: {takes: [takes_array[i]]},
							$inc: {total_takes:-1}}, function (err, result) {
							if (err) {
								res.json(err);
							}
							else {
								res.json({msg: 'Deleted take successfully'});
							}
					});
				}
			}
		})
	}
	else {
		res.send("Access Denied");
	}
});

router.delete('/user/:username/:apikey', function(req, res) {
	if (req.params.apikey == process.env.API_KEY) {
		User.deleteOne({username: req.params.username}, function(err, result) {
			if (err) {
				res.json(err);
			}
			else {
				res.json({msg: req.params.username+" deleted successfully"});
			}
		})
	}
	else {
		res.send("Access Denied");
	}
});

function getName(outcome_name) {
	let comma = outcome_name.indexOf(",");
	return outcome_name.slice(comma+2) + " " + outcome_name.slice(0, comma);
}

function createGameDesc(type, outcome_name, participants, game_date, default_str) {
	let date = new Date(game_date);
	date.setHours(date.getHours()-8);
	const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
	if (type == "Moneyline") {
		if (participants[0].name.trim() == outcome_name) {
			return "The " + outcome_name + " will beat the " + participants[1].name.trim() +
			 " (" + month[date.getMonth()] + " " + date.getDate() + ")";
		}
		else {
			return "The " + outcome_name + " will beat the " + participants[0].name.trim() +
			" (" + month[date.getMonth()] + " " + date.getDate() + ")";
		}
	}
	else if (type == "Spread") {
		let plus_or_minus = outcome_name.indexOf("+") == -1 ? "beat the " : "not lose to the ";
		let team_name, points;
		if (outcome_name.split(" ").length == 2) {
			team_name = outcome_name.split(" ")[0];
			points = Math.abs(parseInt(outcome_name.split(" ")[1]));
		}
		else {
			team_name = outcome_name.split(" ")[0]+" "+outcome_name.split(" ")[1];
			points = Math.abs(parseInt(outcome_name.split(" ")[2]));
		}
		if (team_name == participants[0].name.trim()) {
			return "The " + team_name + " will " + plus_or_minus + participants[1].name.trim() +
			" by more than " + points + " points " + "(" + month[date.getMonth()] + " " + date.getDate() + ")";
		}
		else {
			return "The " + team_name + " will " + plus_or_minus + participants[0].name.trim() +
			" by more than " + points + " points " + "(" + month[date.getMonth()] + " " + date.getDate() + ")";
		}
	}
	else {
		return default_str;
	}
}

function createDescription(market_specifier, outcome_name, default_str) {
	const SEASON = "2022-23";
	const CHAMPIONSHIP = "pre:markettext:155949";
	const MVP = "pre:markettext:156095";
	const EASTERN_CONFERENCE_CHAMP = "pre:markettext:156277";
	const WESTERN_CONFERENCE_CHAMP = "pre:markettext:156279";
	const ROY = "pre:markettext:157005";
	const SIXMOY = "pre:markettext:157863";
	const MIP = "pre:markettext:158475";
	const DPOY = "pre:markettext:158957";
	const COTY = "pre:markettext:159319";
	const SWWINNER = "pre:markettext:160175";
	const NWWINNER = "pre:markettext:160177";
	const ATWINNER = "pre:markettext:160179";
	const PACWINNER = "pre:markettext:160181";
	const SEWINNER = "pre:markettext:160183";
	const CENWINNER = "pre:markettext:160185";
	const PLAYOFFS = "pre:markettext:161545";
	const REG_SEAS_WINS_MIN = "pre:markettext:161607";
	const REG_SEAS_WINS_MAX = "pre:markettext:167035";
	if (market_specifier == CHAMPIONSHIP) {
		return "The " + outcome_name + " will win the " + SEASON + " NBA Championship";
	}
	else if (market_specifier == MVP) {
		return getName(outcome_name) + " will win the " + SEASON + " MVP";
	}
	else if (market_specifier == EASTERN_CONFERENCE_CHAMP) {
		return "The " + outcome_name + " will win the " + SEASON + " Eastern Conference";
	}
	else if (market_specifier == WESTERN_CONFERENCE_CHAMP) {
		return "The " + outcome_name + " will win the " + SEASON + " Western Conference";
	}
	else if (market_specifier == ROY) {
		return getName(outcome_name) + " will win the " + SEASON + " Rookie of the Year";
	}
	else if (market_specifier == SIXMOY) {
		return getName(outcome_name) + " will win the " + SEASON + " 6th Man of the Year";
	}
	else if (market_specifier == MIP) {
		return getName(outcome_name) + " will win the " + SEASON + " Most Improved Player";
	}
	else if (market_specifier == DPOY) {
		return getName(outcome_name) + " will win the " + SEASON + " Defensive Player of the Year";
	}
	else if (market_specifier == COTY) {
		return getName(outcome_name) + " will win the " + SEASON + " Coach of the Year";
	}
	else if (market_specifier == SWWINNER) {
		return "The " + outcome_name + " will win the Southwest division (" + SEASON + ")";
	}
	else if (market_specifier == NWWINNER) {
		return "The " + outcome_name + " will win the Northwest division (" + SEASON + ")";
	}
	else if (market_specifier == ATWINNER) {
		return "The " + outcome_name + " will win the Atlantic division (" + SEASON + ")";
	}
	else if (market_specifier == PACWINNER) {
		return "The " + outcome_name + " will win the Pacific division (" + SEASON + ")";
	}
	else if (market_specifier == SEWINNER) {
		return "The " + outcome_name + " will win the Southeast division (" + SEASON + ")";
	}
	else if (market_specifier == CENWINNER) {
		return "The " + outcome_name + " will win the Central division (" + SEASON + ")";
	}
	else if (default_str.split(" - ")[1] == "To Reach the Playoffs") {
		let team_name = default_str.split(" - ")[2];
		if (outcome_name == "Yes") {
			return "The " + team_name + " will make the playoffs";
		}
		else {
			return "The " + team_name + " will not make the playoffs";
		}
	}
	else if (default_str.split(" - ")[1] == "Regular Season Wins") {
		let team_name = default_str.split(" - ")[2];
		if (outcome_name.indexOf("Over") != -1) {
			return "The " + team_name + " will win more than " + parseInt(outcome_name.split(" ")[1]) + " games";
		}
		else {
			return "The " + team_name + " will win less than " + (parseInt(outcome_name.split(" ")[1])+1) + " games";
		}
	}
	else if (default_str == "NBA - Regular Season - Player - Points Per Game Leader") {
		return getName(outcome_name) + " will lead the league in points per game (" + SEASON + ")";
	}
	else if (default_str.split(" - ")[1] == "Most Regular Season Wins") {
		return "The " + outcome_name + " will win the most regular season games (" + SEASON + ")";
	}
	else if (default_str.split(" - ")[1] == "Regular Season" && default_str.split(" - ")[2] == "Eastern Conference Number 1 Seed") {
		return "The " + outcome_name + " will be the #1 seed in the Eastern Conference (" + SEASON + ")";
	}
	else if (default_str.split(" - ")[1] == "Regular Season" && default_str.split(" - ")[2] == "Western Conference Number 1 Seed") {
		return "The " + outcome_name + " will be the #1 seed in the Western Conference (" + SEASON + ")";
	}
	else if (default_str == "NBA - Regular Season - Player - Three Pointers Made Leader") {
		return getName(outcome_name) + " will lead the league in 3's (" + SEASON + ")";
	}
	else if (default_str == "NBA - Regular Season - Most Assists Per Game") {
		return getName(outcome_name) + " will lead the league in assists per game (" + SEASON + ")";
	}
	else if (default_str == "NBA 2022/23 - Regular Season - Player - Most Blocks Per Game") {
		return getName(outcome_name) + " will lead the league in blocks per game (" + SEASON + ")";
	}
	else if (default_str == "NBA 2022/23 - Regular Season - Player - Most Steals Per Game") {
		return getName(outcome_name) + " will lead the league in steals per game (" + SEASON + ")";
	}
	else {
		console.log(default_str+": "+outcome_name);
		return null;
	}
}

function insertMatch(item) {
	var match_particpants, game_date, markets, market, bet_type;
	//const AWS_UTC_SHIFT = 4;
	match_participants = item.participants;
	game_date = new Date(item.startTime);
	//console.log(game_date);
	//game_date.setHours(game_date.getHours()-AWS_UTC_SHIFT);
	markets = item.markets;
	for (j = 0; j < markets.length; j++) {
		market = markets[j];
		bet_type = markets[j].name;
		if (bet_type == "Moneyline") {
			insertMoneylineTake(market, bet_type, match_participants, item.startTime);
		}
		else if (bet_type == "Spread") {
			insertSpreadTake(market, bet_type, match_participants, item.startTime);
		}
	}
}


function insertMoneylineTake(market, bet_type, match_participants, game_date) {
	var homeTeam, awayTeam, outcomes, bet_outcome, take, bet_odds;
	var TipicoTake;
	outcomes = market.outcomes;
	for (k = 0; k < outcomes.length; k++) {
		bet_outcome = outcomes[k];
		homeTeam = match_participants[0].name.trim();
		awayTeam = match_participants[1].name.trim();
		//take = match_participants[1].name+" vs "+match_participants[0].name+": "+bet_outcome.name;
		take = createGameDesc(bet_type, bet_outcome.name.trim(), match_participants, game_date, take);
		bet_odds = parseInt(bet_outcome.formatAmerican);
		TipicoTake = new Tipico({
			event_date: game_date,
			event_type: bet_type,
			homeTeam: homeTeam,
			awayTeam: awayTeam,
			description: take,
			odds: bet_odds,
			outcome: bet_outcome.name.trim()
		});
		TipicoTake.save(function(err, result) {
			if (err) {
				console.log(err);
			}
			else {
				console.log("moneyline take added");
			}
		});
	}
}

function insertSpreadTake(market, bet_type, match_participants, game_date) {
	var homeTeam, awayTeam, outcomes, bet_outcome, take, bet_odds;
	var bet_outcome_split, bet_team, bet_spread;
	var TipicoTake;
	outcomes = market.outcomes;
	for (k = 0; k < outcomes.length; k++) {
		bet_outcome = outcomes[k];
		homeTeam = match_participants[0].name.trim();
		awayTeam = match_participants[1].name.trim();
		//take = match_participants[1].name+" vs "+match_participants[0].name+": "+bet_outcome.name;
		take = createGameDesc(bet_type, bet_outcome.name.trim(), match_participants, game_date, take);
		bet_odds = parseInt(bet_outcome.formatAmerican);
		bet_outcome_split = bet_outcome.name.trim().split(" ");
		if (bet_outcome_split.length == 2) {
			bet_team = bet_outcome_split[0];
			bet_spread = parseFloat(bet_outcome_split[1]);
		}
		else {
			bet_team = bet_outcome_split[0] + " " + bet_outcome_split[1];
			bet_spread = parseFloat(bet_outcome_split[2]);
		}
		TipicoTake = new Tipico({
			event_date: game_date,
			event_type: bet_type,
			homeTeam: homeTeam,
			awayTeam: awayTeam,
			description: take,
			odds: bet_odds,
			outcome: bet_outcome.name.trim(),
			coveringTeam: bet_team,
			spread: bet_spread
		});
		TipicoTake.save(function(err, result) {
			if (err) {
				console.log(err);
			}
			else {
				console.log("spread take added");
			}
		});
	}
}

function getOutcomeNames(outcome) {
	return {participant: outcome.name.trim()};
}

async function insertRegWinsTake(market, today) {
	try {
		const ALL_OU_ADJUST = -.4;
		let over_and_under = market.outcomes;
		let wins = parseFloat(over_and_under[0].name.trim().split(" ")[1]);
		if (over_and_under.length != 2) {
			console.log("more than 2 outcomes for over/under");
			return;
		}
		if (over_and_under[0].name.trim().split(" ")[0] == "Over") {
			let wins_adjust = over_and_under[0].formatDecimal - over_and_under[1].formatDecimal;
			wins -= wins_adjust;
		}
		else {
			let wins_adjust = over_and_under[1].formatDecimal - over_and_under[0].formatDecimal;
			wins -= wins_adjust;
		}
		wins += ALL_OU_ADJUST;
		console.log(market.name + ": " + wins);
		update_take = await HistoricalOdds.updateOne({take: "Regular Season Wins Projections"}, 
					{$push: {"all_odds.$[element].participant_odds": {date: today, projection: wins}}},
					{arrayFilters: [{"element.participant": market.name.trim().split(" - ")[2]}]});
				if (update_take.modifiedCount == 0) {let insert_new = await HistoricalOdds.findOneAndUpdate({take: "Regular Season Wins Projections"}, 
					{$push: {all_odds: {participant: market.name.trim().split(" - ")[2], participant_odds: [{date: today, projection: wins}]}}})}
		return wins;
	} catch(err) {
		console.log(err);
	}
}

function insertFuture(item, count, today) {
(async () => {
try {
	var bet_type, bet_length, markets, market, bet_category, bet_specifier, outcomes;
	var bet_outcome, take, bet_odds, bet_pct, outcome_names, today;
	var TipicoTake, update_take, adjust_pcts, market_pct_sum, market_count, dec_val;
	var vegas_theft = [];
	var sum = 0;
	bet_type = "Future";
	bet_length = item.eventDetails.outrightType;
	markets = item.markets;
	today = new Date();
	var regSeasonWins = markets.filter(item => item.name.split(" - ")[1] == "Regular Season Wins").map(item2 => {return {participant: item2.name.trim().split(" - ")[2]}});
	var winsInsert = await HistoricalOdds.findOneAndUpdate({take: "Regular Season Wins Projections"}, {$setOnInsert: {take: "Regular Season Wins Projections", all_odds: regSeasonWins}}, {upsert: true});
	for (j = 0; j < markets.length; j++) {
		market = markets[j];
		bet_category = market.name;
		bet_specifier = market.specifier[0].value;
		outcomes = market.outcomes;
		outcome_names = outcomes.map(getOutcomeNames);
		//(async () => {
		//	try {
		if (market.name.split(" - ")[1] != "Regular Season Wins") {
			var insert = await HistoricalOdds.findOneAndUpdate({take: bet_category}, {$setOnInsert: {take: bet_category, all_odds: outcome_names}}, {upsert: true});
			market_count = outcomes.length;
			market_pct_sum = outcomes.reduce((accumulator, object) => {
				return accumulator + 1/object.formatDecimal;
			}, 0);
			if (market.name.split(" - ")[1] == "To Make Eastern Conference Play-In Tournament" || market.name.split(" - ")[1] == "To Make Western Conference Play-In Tournament")
				{market_pct_sum /= 2;}
			console.log(bet_category + ": " + market_pct_sum);
			vegas_theft.push(bet_category + ": " + market_pct_sum);
			dec_val = (market_pct_sum-1)/market_count;
		}
		else {
			sum += insertRegWinsTake(market, today);
			console.log(sum);
		}
		for (k = 0; k < outcomes.length; k++) {
			bet_outcome = outcomes[k];
			//take = category+": "+outcome.name;
			take = createDescription(bet_specifier, bet_outcome.name, bet_category.trim());
			bet_odds = parseInt(bet_outcome.formatAmerican);
			if (take != null) {
				//bet_odds = parseInt(bet_outcome.formatAmerican);
				TipicoTake = new Tipico({
					event_type: bet_type,
					description: take,
					odds: bet_odds,
					length: bet_length,
					category: bet_category.trim(),
					specifier: bet_specifier,
					outcome: bet_outcome.name.trim()
				});
				TipicoTake.save(function(err, result) {
					if (err) {
						console.log(err);
					}
					else {
						count++;
						console.log("futurecount: " + count);
					}
				});
			}
			if (market.name.split(" - ")[1] != "Regular Season Wins") {
				bet_pct = 1/bet_outcome.formatDecimal;
				update_take = await HistoricalOdds.updateOne({take: bet_category}, 
					{$push: {"all_odds.$[element].participant_odds": {date: today, odd: bet_odds, pct: bet_pct/market_pct_sum}}},
					{arrayFilters: [{"element.participant": bet_outcome.name.trim()}]});
				if (update_take.modifiedCount == 0) {let insert_new = await HistoricalOdds.findOneAndUpdate({take: bet_category}, 
					{$push: {all_odds: {participant: bet_outcome.name.trim(), participant_odds: [{date: today, odd: bet_odds, pct: bet_pct/market_pct_sum}]}}})}		
			}
		}
		//adjust_pcts = await HistoricalOdds.findOneAndUpdate({take: bet_category},
		//	{$set: {all_odds}});
	}
	console.log(vegas_theft);

} catch (err) {
	console.log(err);
}
}) ();

}

router.get('/odds/historical', function(req, res) {
	HistoricalOdds.find(function(err, result) {
		res.json(result);
	});
});

router.get('/odds/historical/take/:id', function(req, res) {
	HistoricalOdds.findOne({_id: req.params.id}, function(err, odds) {
		if (err) {
			res.json(err);
		}
		else {
			res.json(odds);
		}
	});
});

router.get('/odds/historical/default', function(req, res) {
	HistoricalOdds.findOne({take: "NBA - Winner"}, function(err, odds) {
		if (err) {
			res.json(err);
		}
		else {
			res.json(odds);
		}
	});
});

router.delete('/odds/historical/clear/:apikey', function(req, res) {
	if (req.params.apikey == process.env.API_KEY) {
		HistoricalOdds.deleteMany(function(err, result) {
				if (err) {res.send(err);}
				else {
					res.send("deleted historical odds successfully");
				}
			})
	}
	else {
		res.send("Access Denied");
	}
});

router.get('/odds/:apikey', function(req, res) {
	if (req.params.apikey == process.env.API_KEY) {
		const NBA_ID = 61;
		var count = 0;
		const AWS_UTC_SHIFT = 4;
		const today = new Date();
		(async () => {
			try {
				const response = await axios('https://sportsbook-nj.tipico.us/v1/content/program/fe/groups/61/events?licenseId=US-NJ&lang=en&fields=BETMARKETS%2CGROUPS');
				var result = response.data;
				const delete_takes = await Tipico.deleteMany();
				for (i = 0; i < result.length; i++) {
					var item = result[i];
					if (item.eventType == "MATCH") {
						insertMatch(item);
					}
					else if (item.eventType == "OUTRIGHT") {
						insertFuture(item, count, today);
					}
				}
				res.send(result);
			} catch (err) {
				console.log(err);
			}
		}) ();
	}
	else {
		res.send("Access Denied");
	}

});

router.get('/tipico/odds', function(req, res) {
	Tipico.find(function(err, result) {
		res.json(result);
	})
});

async function constructGameLog(player_box, teamName, opponentName, date, gameLocation, wonGame) {
	return {
		game_date: date,
		opponent: opponentName,
		location: gameLocation,
		mins: player_box.statTotal.mins,
		secs: player_box.statTotal.secs,
		points: player_box.statTotal.points,
		fgm: player_box.statTotal.fgm,
		fga: player_box.statTotal.fga,
		tpm: player_box.statTotal.tpm,
		tpa: player_box.statTotal.tpa,
		ftm: player_box.statTotal.ftm,
		fta: player_box.statTotal.fta,
		assists: player_box.statTotal.assists,
		rebounds: player_box.statTotal.rebs,
		TOs: player_box.statTotal.turnovers,
		plus_minus: parseInt(player_box.boxscore.plusMinus),
		techs: player_box.statTotal.technicalFouls,
		win: (wonGame) ? 1:0,
	}
}

async function insertHomePlayersStats(homePlayers, teamName, opponentName, date, wonGame) {
	try {
		for (j = 0; j < homePlayers.length; j++) {
			if (!(homePlayers[j].statTotal.mins == 0 && homePlayers[j].statTotal.secs == 0)) {
				console.log(homePlayers[j].profile.displayName+" time played- "+homePlayers[j].statTotal.mins+":"+homePlayers[j].statTotal.secs);
				var game_log = await constructGameLog(homePlayers[j], teamName, opponentName, date, "H", wonGame);
				//console.log(game_log);
				var newPlayer = await Players.updateOne({name: homePlayers[j].profile.displayName}, 
					{
						$push: {game_logs: game_log},
						$inc: {games_played: 1,
							   total_points: game_log.points,
							   total_assists: game_log.assists,
							   total_rebounds: game_log.rebounds,
							   total_fgm: game_log.fgm,
							   total_fga: game_log.fga,
							   total_3sM: game_log.tpm,
							   total_3sA: game_log.tpa,
							   total_ftm: game_log.ftm,
							   total_fta: game_log.fta,
							   total_TOs: game_log.TOs,
							   total_plus_minus: game_log.plus_minus,
							   total_mins: game_log.mins+(game_log.secs/60),
							   total_techs: game_log.techs,
							   total_wins: game_log.win
						},
						$setOnInsert: {name: homePlayers[j].profile.displayName, 
									   team: teamName,
						}
					}, 
					{upsert: true});
				console.log(newPlayer);
			}
		}
	} catch (err) {
		console.log(err);
	}

}

async function insertAwayPlayersStats(awayPlayers, teamName, opponentName, date, wonGame) {
	try {
		for (k = 0; k < awayPlayers.length; k++) {
			if (!(awayPlayers[k].statTotal.mins == 0 && awayPlayers[k].statTotal.secs == 0)) {
				console.log(awayPlayers[k].profile.displayName+" time played- "+awayPlayers[k].statTotal.mins+":"+awayPlayers[k].statTotal.secs);
				var game_log = await constructGameLog(awayPlayers[k], teamName, opponentName, date, "A", wonGame);
				//console.log(game_log);
				var newPlayer = await Players.updateOne({name: awayPlayers[k].profile.displayName}, 
					{
						$push: {game_logs: game_log},
						$inc: {games_played: 1,
							   total_points: game_log.points,
							   total_assists: game_log.assists,
							   total_rebounds: game_log.rebounds,
							   total_fgm: game_log.fgm,
							   total_fga: game_log.fga,
							   total_3sM: game_log.tpm,
							   total_3sA: game_log.tpa,
							   total_ftm: game_log.ftm,
							   total_fta: game_log.fta,
							   total_TOs: game_log.TOs,
							   total_plus_minus: game_log.plus_minus,
							   total_mins: game_log.mins+(game_log.secs/60),
							   total_techs: game_log.techs,
							   total_wins: game_log.win
						},
						$setOnInsert: {name: awayPlayers[k].profile.displayName, 
									   team: teamName,
						}
					}, 
					{upsert: true});
				console.log(newPlayer);
			}
		}
	} catch (err) {
		console.log(err);
	}
}

async function createTeamGameLog(team_box, opponentName, date, gameLocation, wonGame, pt_diff, game_ots) {
	return {
		game_date: date,
		opponent: opponentName,
		location: gameLocation,
		points: team_box.score,
		fgm: team_box.fgm,
		fga: team_box.fga,
		tpm: team_box.tpm,
		tpa: team_box.tpa,
		ftm: team_box.ftm,
		fta: team_box.fta,
		assists: team_box.assists,
		rebounds: team_box.rebs,
		TOs: team_box.turnovers,
		point_differential: pt_diff,
		techs: team_box.technicalFouls,
		ots: game_ots,
		win: (wonGame) ? 1:0
	}
}

async function insertTeamStats(team_box, teamName, opponentName, date, gameLocation, wonGame, pt_diff, ots) {
	try {
		var game_log = await createTeamGameLog(team_box, opponentName, date, gameLocation, wonGame, pt_diff, ots);
		var newTeam = await Teams.updateOne({name: teamName}, //not done
			{
				$push: {game_logs: game_log},
				$inc: {games_played: 1,
					   total_points: game_log.points,
					   total_assists: game_log.assists,
					   total_rebounds: game_log.rebounds,
					   total_fgm: game_log.fgm,
					   total_fga: game_log.fga,
					   total_3sM: game_log.tpm,
					   total_3sA: game_log.tpa,
					   total_ftm: game_log.ftm,
					   total_fta: game_log.fta,
					   total_TOs: game_log.TOs,
					   total_point_differential: game_log.point_differential,
					   total_techs: game_log.techs,
					   total_ots: game_log.ots,
					   total_wins: game_log.win
				},
				$setOnInsert: {name: teamName}
			}, 
			{upsert: true});
		console.log(newTeam);
	} catch (err) {
		console.log(err);
	}
}

function getPlayerStats(player) {
	return {
		name: player.profile.displayName,
		starter: player.boxscore.isStarter,
		mins: player.statTotal.mins,
		secs: player.statTotal.secs,
		points: player.statTotal.points,
		assists: player.statTotal.assists,
		rebounds: player.statTotal.rebs,
		oreb: player.statTotal.offRebs,
		dreb: player.statTotal.defRebs,
		blocks: player.statTotal.blocks,
		steals: player.statTotal.steals,
		fgm: player.statTotal.fgm,
		fga: player.statTotal.fga,
		tpm: player.statTotal.tpm,
		tpa: player.statTotal.tpa,
		ftm: player.statTotal.ftm,
		fta: player.statTotal.fta,
		fouls: player.statTotal.fouls,
		turnovers: player.statTotal.turnovers,
		plus_minus: parseInt(player.boxscore.plusMinus),
		technicals: player.statTotal.technicalFouls,
	}
}

async function createBoxScore(season, gameProfile, boxscore, team, location, opponent) {
	let players = team.gamePlayers.map(getPlayerStats);
	return {
		game_date: gameProfile.dateTimeEt,
		seasonType: season.scheduleSeasonType,
		attendance: parseInt(boxscore.attendance.split(",").join("")),
		location: location,
		opponent: opponent,
		point_differential: (location == "H") ? (boxscore.homeScore-boxscore.awayScore):(boxscore.awayScore-boxscore.homeScore),
		win: ((location == "H" && boxscore.homeScore>boxscore.awayScore) || (location == "A" && boxscore.awayScore>boxscore.homeScore)) ? 1:0,
		points: team.score.score,
		assists: team.score.assists,
		rebounds: team.score.rebs,
		oreb: team.score.offRebs,
		dreb: team.score.defRebs,
		q1Score: team.score.q1Score,
		q2Score: team.score.q2Score,
		q3Score: team.score.q3Score,
		q4Score: team.score.q4Score,
		overtimes: (team.score.mins-240)/25,
		paintPoints: team.score.pointsInPaint,
		fastBreakPoints: team.score.fastBreakPoints,
		pointsOffTurnovers: team.score.pointsOffTurnovers,
		blocks: team.score.blocks,
		steals: team.score.steals,
		fgm: team.score.fgm,
		fga: team.score.fga,
		tpm: team.score.tpm,
		tpa: team.score.tpa,
		ftm: team.score.ftm,
		fta: team.score.fta,
		turnovers: team.score.turnovers,
		fouls: team.score.fouls,
		techincals: team.score.technicalFouls,
		flagrants: team.score.flagrantFouls,
		ejections: team.score.ejections,
		players: players
	}
}

async function insertBoxScore(payload) {
	try {
		let home_box = await createBoxScore(payload.season, payload.gameProfile, payload.boxscore, payload.homeTeam, "H", payload.awayTeam.profile.name);
		let away_box = await createBoxScore(payload.season, payload.gameProfile, payload.boxscore, payload.awayTeam, "A", payload.homeTeam.profile.name);

		let updateHomeTeam = await BoxScores.updateOne({team: payload.homeTeam.profile.name}, //not done
			{
				$push: {box_scores: home_box},
				$inc: {currentWins: (payload.boxscore.homeScore>payload.boxscore.awayScore) ? 1:0,
					   currentLosses: (payload.boxscore.awayScore>payload.boxscore.homeScore) ? 1:0},
				$setOnInsert: {team: payload.homeTeam.profile.name, season: payload.season.yearDisplay}
			}, 
			{upsert: true});
		let updateAwayTeam = await BoxScores.updateOne({team: payload.awayTeam.profile.name}, //not done
			{
				$push: {box_scores: away_box},
				$inc: {currentWins: (payload.boxscore.awayScore>payload.boxscore.homeScore) ? 1:0,
					   currentLosses: (payload.boxscore.homeScore>payload.boxscore.awayScore) ? 1:0},
				$setOnInsert: {team: payload.awayTeam.profile.name, season: payload.season.yearDisplay}
			}, 
			{upsert: true});
		home_box.players = [];
		away_box.players = [];
		console.log(home_box);
		console.log(away_box);
	} catch (err) {
		console.log(err);
	}
}

router.get('/stats/update/boxscores/temp/:apikey', function(req, res) {
	if (req.params.apikey == process.env.API_KEY) {
		if (!statsUpdatesDone) {
			(async () => {
				try {
					const today = new Date();
					today.setHours(today.getHours()-7); //AWS line
					const response = await axios('https://uk.global.nba.com/stats2/scores/gamedaystatus.json?gameDate='+today.getFullYear()+'-'+(today.getMonth()+1)+'-'+(today.getDate()-1)+'&locale=en&tz=-8');
					var todays_games = response.data.payload.gameDates[0].games;
					console.log(todays_games);
					for (i = 0; i < todays_games.length; i++) {
						if (todays_games[i].status == "3" && !updatedGamesIds_Stats.includes(todays_games[i].gameId)) {
							var response2 = await axios('https://uk.global.nba.com/stats2/game/snapshot.json?countryCode=US&gameId='+todays_games[i].gameId+'&locale=en&tz=-5');
							var box_score = response2.data.payload;
							insertBoxScore(box_score);
						}
					}
					res.send(today+": done");
			} catch (err) {
					console.log(err);
				}
			}) ();
			}
			else {res.send("stats update already completed");}
	}
	else {
		res.send("Access Denied");
	}
})

router.get('/stats/update/:apikey', function(req, res) {
	//totalGames = 2;
	if (req.params.apikey == process.env.API_KEY) {
		if (!statsUpdatesDone) {
		(async () => {
			try {
				const today = new Date();
				today.setHours(today.getHours()-20); //AWS line
				console.log(today);
				const response = await axios('https://uk.global.nba.com/stats2/scores/gamedaystatus.json?gameDate='+today.getFullYear()+'-'+(today.getMonth()+1)+'-'+(today.getDate())+'&locale=en&tz=-8');
				var todays_games = response.data.payload.gameDates[0].games;
				console.log(todays_games);
				for (i = 0; i < todays_games.length; i++) {
					if (todays_games[i].status == "3" && !updatedGamesIds_Stats.includes(todays_games[i].gameId)) {
						updatedGamesIds_Stats.push(todays_games[i].gameId);
						var response2 = await axios('https://uk.global.nba.com/stats2/game/snapshot.json?countryCode=US&gameId='+todays_games[i].gameId+'&locale=en&tz=-5');
						var box_score = response2.data.payload;
						var homePlayers = box_score.homeTeam.gamePlayers;
						var awayPlayers = box_score.awayTeam.gamePlayers;
						let home = await insertHomePlayersStats(homePlayers, box_score.homeTeam.profile.name, box_score.awayTeam.profile.name, box_score.gameProfile.dateTimeEt, (box_score.boxscore.homeScore > box_score.boxscore.awayScore));
						let away = await insertAwayPlayersStats(awayPlayers, box_score.awayTeam.profile.name, box_score.homeTeam.profile.name, box_score.gameProfile.dateTimeEt, (box_score.boxscore.awayScore > box_score.boxscore.homeScore));
						let homeTeam = await insertTeamStats(box_score.homeTeam.score, box_score.homeTeam.profile.name, box_score.awayTeam.profile.name, box_score.gameProfile.dateTimeEt, "H", (box_score.boxscore.homeScore > box_score.boxscore.awayScore), (box_score.boxscore.homeScore - box_score.boxscore.awayScore), parseInt(box_score.boxscore.period)-4);
						let awayTeam = await insertTeamStats(box_score.awayTeam.score, box_score.awayTeam.profile.name, box_score.homeTeam.profile.name, box_score.gameProfile.dateTimeEt, "A", (box_score.boxscore.awayScore > box_score.boxscore.homeScore), (box_score.boxscore.awayScore - box_score.boxscore.homeScore), parseInt(box_score.boxscore.period)-4);
						let boxScores = await insertBoxScore(box_score);
					}
				}
				if (updatedGamesIds_Stats.length == totalGames) {
					statsUpdatesDone = true;
				}
				res.send("stats update done? " + statsUpdatesDone);
			} catch (err) {
				console.log(err);
			}
		}) ();
		}
		else {res.send("stats update already completed");}
	}
	else {
		res.send("Access Denied");
	}
});

router.get('/stats/players/get', function(req, res) {
	Players.find(function(err, result) {
		res.send(result);
	});
});

router.get('/stats/players/get/noids', function(req, res) {
	Players.find({}, {_id: 0}, function(err, result) {
		res.send(result);
	})
})

router.get('/stats/teams/get', function(req, res) {
	Teams.find(function(err, result) {
		res.send(result);
	});
});

router.get('/stats/teams/get/noids', function(req, res) {
	Teams.find({}, {_id: 0}, function(err, result) {
		res.send(result);
	})
})

router.get('/stats/teams/gen', function(req, res) {
	Teams.find({}, {game_logs: 0}, function(err, result) {
		res.send(result);
	});
});

router.get('/stats/boxscores/get/noids', function(req, res) {
	BoxScores.find({}, {_id: 0}, function(err, result) {
		res.send(result);
	})
})

router.get('/stats/boxscores/get', function(req, res) {
	BoxScores.find(function(err, result) {
		res.send(result);
	})
});

router.get('/stats/players/gamelogs/:playerid', function(req, res) {
	Players.findOne({_id: req.params.playerid}, {game_logs: 1}, function(err, result) {
		res.send(result);
	});
});

router.get('/stats/teams/gamelogs/:teamid', function(req, res) {
	Teams.findOne({_id: req.params.teamid}, {game_logs: 1}, function(err, result) {
		res.send(result);
	});
});

router.get('/stats/players/names', function(req, res) {
	Players.find({}, {name: 1, _id: 1}, function(err, result) {
		res.send(result);
	});
});

router.get('/stats/players/findid/:name', function(req, res) {
	Players.findOne({name: req.params.name.split("1").join(" ")}, {_id: 1}, function(err, result) {
		res.json(result);
	});
});

router.get('/stats/teams/names', function(req, res) {
	Teams.find({}, {name: 1}, function(err, result) {
		res.send(result);
	});
});

router.get('/stats/all/generalinfo', function(req, res) {
	Teams.aggregate([
		{$group: 
			{_id: '', 
			fgm: {$sum: "$total_fgm"}, fga: {$sum: "$total_fga"},
			tpm: {$sum: "$total_3sM"}, tpa: {$sum: "$total_3sA"},
			ftm: {$sum: "$total_ftm"}, fta: {$sum: "$total_fta"},
			techs: {$sum: "$total_techs"}, 
			count: {$sum: 1}}
		},
		{$project: 
			{fgm: 1, fga: 1, fgpct: {$divide: ["$fgm", "$fga"]}, 
			tpm: 1, tpa: 1, tppct: {$divide: ["$tpm", "$tpa"]},
			ftm: 1, fta: 1, ftpct: {$divide: ["$ftm", "$fta"]},
			tspct: {$divide: 
					[{$add: 
						[{$add: ["$fgm", 
							{$multiply: ["$tpm", .5]}
						]}, 
						{$multiply: ["$ftm", .5]}]
					},
					{$add: ["$fga", {$multiply: ["$fta", .44]}]}
					]
			},
			efg: {$divide: 
					[{$add: ["$fgm", {$multiply: ["$tpm", .5]}]}, "$fga"]},
			techs: 1}
		}
	],
	function(err, result) {
		res.send(result);
	});
});

router.get('/stats/boxscores/:hometeam/:awayteam/:date', function(req, res) {
	let home = req.params.hometeam;
	let away = req.params.awayteam;
	home = (home == 'trailblazers') ? "Trail Blazers":(home[0].toUpperCase()+home.slice(1));
	away = (away == 'trailblazers') ? "Trail Blazers":(away[0].toUpperCase()+away.slice(1));
	console.log(home);
	console.log(away);
	let curr_day = req.params.date.split("-");
	if (curr_day[2] < 10) {curr_day[2]="0"+curr_day[2];}
	if (curr_day[1] < 10) {curr_day[1]="0"+curr_day[1];}
	curr_day = curr_day.join("-");
	console.log(new Date(curr_day+"T07:00Z"));
	let month = {"1": 31, "2": 28, "3": 31, "4": 30, "5": 31, "6": 30, "7": 31,
				"8": 31, "9": 30, "10": 31, "11": 30, "12": 31, "01": 31, "02": 28, "03": 31, "04": 30, "05": 31, "06": 30, "07": 31,
				"08": 31, "09": 30}
	let next_day = req.params.date;
	next_day = next_day.split("-");
	next_day.push(parseInt(next_day.pop())%month[next_day[1]]+1);
	if (next_day[2] == 1) {
		next_day[1]=next_day[1]%12+1;
		if (next_day[1] == 1) {//
			next_day[0] = parseInt(next_day[0])+1;//
		}//
	}
	if (next_day[2] < 10) {next_day[2]="0"+next_day[2];}
	if (next_day[1] < 10) {next_day[1]="0"+next_day[1];}
	next_day = next_day.join("-");
	console.log(next_day);
	console.log(new Date(next_day+"T07:00Z"));
	BoxScores.aggregate([
		{$match: 
			{$or: 
				[{team: home}, 
				{team: away}]
		}}, 
		{$project: 
			{
				team: '$team',
				box_scores: 
					{$filter: 
						{input: "$box_scores", 
						as: "box_scores", 
						cond: {$or: [{$and: [{$eq: ['$$box_scores.opponent', away]}, {$gte: ['$$box_scores.game_date', new Date(curr_day+"T07:00Z")]}, {$lte: ['$$box_scores.game_date', new Date(next_day+"T07:00Z")]}]}, 
									{$and: [{$eq: ['$$box_scores.opponent', home]}, {$gte: ['$$box_scores.game_date', new Date(curr_day+"T07:00Z")]}, {$lte: ['$$box_scores.game_date', new Date(next_day+"T07:00Z")]}]}]}}
					},
				_id:0}
		}],
	function(err, result) {
		res.send(result);
	})
});

router.get('/stats/teams/:teamname/players/list', function(req, res) {
	var team_name = req.params.teamname;
	if (req.params.teamname == "TrailBlazers") {
		team_name = "Trail Blazers";
	}
	Players.find({team: team_name}, {game_logs: 0}, function(err, result) {
		res.send(result);
	})
})

router.get('/odds/historical/player/:playername', function(req, res) {
	var player = req.params.playername.split("2").join(" ");
	player = player.split("3").join("'");
	console.log(player);
	HistoricalOdds.aggregate([
		{$match: {"all_odds.participant": player}},
		{$unwind: "$all_odds"}, 
		{$match: {"all_odds.participant": player}},
		{$project: 
			{take: 1,
			current_odds: {$arrayElemAt: ["$all_odds.participant_odds", -1]}}
		}
		], 
	function(err, result) {
			if (err) {console.log(err);}
			res.send(result);
	});

})

router.get('/odds/historical/allteams/seasonodds', function(req, res) {
	let takes = ["NBA - Winner", "NBA 2022/23 - Western Conference - Winner", "NBA 2022/23 - Eastern Conference - Winner",
				"NBA 2022/23 - Most Regular Season Wins", "NBA 2022/23 - Regular Season - Western Conference Number 1 Seed - Winner", "NBA 2022/23 - Regular Season - Eastern Conference Number 1 Seed - Winner",
				"Regular Season Wins Projections", "NBA 2022/23 - To Make Western Conference Play-In Tournament", "NBA 2022/23 - To Make Eastern Conference Play-In Tournament",
				"NBA 2022/23 - Division Pacific - Winner (reg. season)", "NBA 2022/23 - Division Northwest - Winner (reg. season)", "NBA 2022/23 - Division Central - Winner (reg. season)",
				"NBA 2022/23 - Division Southeast - Winner (reg. season)", "NBA 2022/23 - Division Southwest - Winner (reg. season)", "NBA 2022/23 - Division Atlantic - Winner (reg. season)"];
	HistoricalOdds.aggregate([
		{$match: {$or: [{take: {$in: takes}}, {take: {$regex: "To Reach the Playoffs"}}]}}, 
		{$unwind: "$all_odds"},
		{$match: {$or: [{take: {$in: takes}}, {$and: [{take: {$regex: "To Reach the Playoffs"}}, {"all_odds.participant": "Yes"}]}]}}, 
		{$group: {_id: "$all_odds.participant", odds: {$push: {take: "$take", current_odd: {$arrayElemAt: ["$all_odds.participant_odds", -1]}}}}}
	], function(err, result) {
		if (err) {console.log(err);}
		res.send(result);
	})

});

router.get('/odds/historical/team/:teamname', function(req, res) {
	const full_team_names = {'Heat': 'Miami Heat', 'Lakers': 'Los Angeles Lakers', 'Celtics': 'Boston Celtics', 
	'Clippers': 'La Clippers', 'Nets': 'Brooklyn Nets', 'Hornets': 'Charlotte Hornets', 'Bulls': 'Chicago Bulls', 
	'Hawks': 'Atlanta Hawks', 'Suns': 'Phoenix Suns', 'Mavericks': 'Dallas Mavericks', 'Nuggets': 'Denver Nuggets', 
	'Pistons': 'Detroit Pistons', 'Warriors': 'Golden State Warriors', 'Rockets': 'Houston Rockets', 'Pacers': 'Indiana Pacers', 
	'Grizzlies': 'Memphis Grizzlies', 'Bucks': 'Milwaukee Bucks', 'Timberwolves': 'Minnesota Timberwolves', 'Pelicans': 'New Orleans Pelicans', 
	'Knicks': 'New York Knicks', 'Thunder': 'Oklahoma City Thunder', 'Magic': 'Orlando Magic', '76ers': 'Philadelphia 76ers', 'TrailBlazers': 'Portland Trail Blazers', 
	'Kings': 'Sacramento Kings', 'Spurs': 'San Antonio Spurs', 'Raptors': 'Toronto Raptors', 'Jazz': 'Utah Jazz', 'Cavaliers': 'Cleveland Cavaliers', 'Wizards': 'Washington Wizards'};
	var team_name = full_team_names[req.params.teamname];
	let regex_name = (req.params.teamname=='Clippers') ? 'Los Angeles Clippers':team_name;
	HistoricalOdds.aggregate([
		{$match: {$or: [{"all_odds.participant": team_name}, {"all_odds.participant": regex_name}, {take: {$regex: regex_name}}]}}, 
		{$unwind: "$all_odds"}, 
		{$match: {$or: [{"all_odds.participant": team_name}, {"all_odds.participant": regex_name}, {$and: [{take: {$regex: regex_name}}, {"all_odds.participant": "Yes"}]}]}}, 
		{$project: {take: 1, current_odds: {$arrayElemAt: ["$all_odds.participant_odds", -1]}}}
	], function(err, result) {
		res.send(result);
	});
});

router.get('/odds/historical/history/:type/:take/:participant', function(req, res) {
	let take_name = req.params.take.split("@").join(" - ");
	take_name = take_name.split("&").join(" ");
	take_name = take_name.split("X").join("/");
	console.log(take_name);
	let participant = req.params.participant.split("2").join(" ");
	if (req.params.type == 'player') {
		participant = participant.split("3").join("'");
	}
	HistoricalOdds.findOne({take: take_name, "all_odds.participant": participant}, 
		{"all_odds.$": 1}, function(err, result) {
			res.send(result);
	});
});

router.get('/odds/historical/current/:take', function(req, res) {
	let take_name = req.params.take.split("@").join(" - ");
	take_name = take_name.split("&").join(" ");
	take_name = take_name.split("X").join("/");
	console.log(take_name);
	HistoricalOdds.aggregate([
		{$match: {take: take_name}},
		{$unwind: "$all_odds"},
		{$project: 
			{participant: "$all_odds.participant", current_odds: {$arrayElemAt: ["$all_odds.participant_odds", -1]}}
		}
	],
	function(err, result) {
		res.send(result);
	})
});

router.delete('/stats/players/delete/:apikey', function(req, res) {
	if (req.params.apikey == process.env.API_KEY) {
		Players.deleteMany(function(err, result) {
			res.send("deleted all player stats successfully");
		});
	}
	else {
		res.send("Access Denied");
	}
});

router.delete('/stats/teams/delete/:apikey', function(req, res) {
	if (req.params.apikey == process.env.API_KEY) {
		Teams.deleteMany(function(err, result) {
			res.send("deleted all team stats successfully");
		});
	}
	else {
		res.send("Access Denied");
	}
});

router.delete('/stats/boxscores/delete/:apikey', function(req, res) {
	if (req.params.apikey == process.env.API_KEY) {
		BoxScores.deleteMany(function(err, result) {
			res.send("deleted all team box scores successfully");
		});
	}
	else {
		res.send("Access Denied");
	}
})

router.get('/update/global/totalgames/:apikey', function(req, res) {
	if (req.params.apikey == process.env.API_KEY) {
		(async() => {
			const today = new Date();
			today.setHours(today.getHours()-20); //AWS line
			const todays_games = await axios('https://uk.global.nba.com/stats2/scores/gamedaystatus.json?gameDate='+today.getFullYear()+'-'+(today.getMonth()+1)+'-'+(today.getDate())+'&locale=en&tz=-8');
			totalGames = todays_games.data.payload.gameDates[0].games.length;
			statsUpdatesDone = false;
			updatedGamesIds_Stats = [];
			console.log("total games today: " + totalGames);
			res.send("total games today: " + totalGames);
		}) ();
	}
	else {
		res.send("Access Denied");
	}
});

router.get('/globalvars',  function(req, res) {
	res.send("totalGames: "+totalGames+"\n"+
			"statsUpdatesDone: "+statsUpdatesDone+"\n"+
			"updatedGamesIds_Stats: "+updatedGamesIds_Stats+"\n"+
			"updatedGames: "+updatedGames);
});

router.delete('/tipico/odds/clear/:apikey', function(req, res) {
	if (req.params.apikey == process.env.API_KEY) {
		Tipico.deleteMany(function(err, result) {
			if (err) {
				console.log(err);
				res.json(err);
			}
			else {
				res.json({msg: 'deleted all takes successfully'});
			}
		});
	}
	else {
		res.send("Access Denied");
	}
});

//delete takes


router.put('/deletetake/:mediaid/:takeid/:apikey', function(req, res, next) {
	if (req.params.apikey == process.env.API_KEY) {
		const BET_VALUE = 50;
		var money_change;
		console.log("working");
		MediaMember.find({_id: req.params.mediaid}, function(err, result) {
			let takes_array = result[0].takes;
			console.log(takes_array);
			for (i = 0; i < takes_array.length; i++) {
				console.log("take_array id: "+ takes_array[i]._id +"  takeid: "+req.params.takeid);
				if (takes_array[i]._id == req.params.takeid) {
					MediaMember.findOneAndUpdate({_id: req.params.mediaid}, 
						{$inc: {total_takes: -1,
								wrong: -1,
								money_gain: 50},
						$pullAll: {takes: [takes_array[i]]}}, function (err, result) {
							if (err) {
								res.json(err);
							}
							else {
								res.json({msg: 'Deleted take successfully'});
							}
					});
				}
			}
		});
	}
	else {
		res.send("Access Denied");
	}
});

router.put('/updatetake/:mediaid/:takeid/:apikey', function(req, res, next) {
	if (req.params.apikey == process.env.API_KEY) {
		const BET_VALUE = 50;
		var money_change;
		console.log("working");
		MediaMember.updateOne({_id: req.params.mediaid, "takes.take":"The Clippers will beat the Timberwolves to make the play-in"}, {$set: {"takes.$.take":"The Clippers will beat the Timberwolves to make the playoffs"}}, function(err, result) {
			if (err) {
				res.json(err);
			}
			else {
				res.json({msg: 'take updated successfully'});
			}
		});
	}
	else {
		res.send("Access Denied");
	}
});

router.put('/media/update/wagered/:apikey', function(req, res) {
	if (req.params.apikey == process.env.API_KEY) {
		const BET_VALUE = 50;
		MediaMember.updateMany({}, [{$set: {wagered: { $multiply: [{ $add: ["$right", "$wrong"]}, BET_VALUE]}}}], function(err, result) {
			if (err) {
				res.json(err);
			}
			else {
				res.json({msg: 'wagered updated successully'});
			}
		});
	}
	else {
		res.send("Access Denied");
	}
});

router.put('/media/update/pctgain/:apikey', function(req, res) {
	if (req.params.apikey == process.env.API_KEY) {
		MediaMember.updateMany({}, [{$set: {pct_gain: {$divide: ["$money_gain", "$wagered"]}}}], function(err, result) {
			if (err) {
				res.json(err);
			}
			else {
				res.json({msg: 'percent gain updated successully'});
			}
		});
	}
	else {
		res.send("Access Denied");
	}
});

router.put('/media/update/ttpct/:apikey', function(req, res) {
	if (req.params.apikey == process.env.API_KEY) {
		MediaMember.updateMany({}, [{$set: {tt_pct: {$divide: ["$right", {$add: ["$right", "$wrong"]}]}}}], function(err, result) {
			if (err) {
				res.json(err);
			}
			else {
				res.json({msg: 'ttpct updated successully'});
			}
		});
	}
	else {
		res.send("Access Denied");
	}
});

router.delete('/users/takes/clear/:apikey', function(req, res) {
	if (req.params.apikey == process.env.API_KEY) {
		User.updateMany({}, {$set: {takes: []}, total_takes: 0, right: 0, wrong: 0, money_gain: 0, tt_pct: 0, wagered: 0, pct_gain: 0}, function(err, result) {
			if (err) {
				res.json(err);
			}
			else {
				res.json({msg: 'takes cleared successfully'});
			}
		});
	}
	else {
		res.send("Access Denied");
	}
})

router.delete('/cleartakes/:apikey', function(req, res, next) {
	if (req.params.apikey == process.env.API_KEY) {
		Take.deleteMany({}, function(err, result) {
			if (err) {
				console.log(err);
				res.json(err);
			}
			else {
				res.json({msg: 'deleted all takes successfully'});
			}
		});
	}
	else {
		res.send("Access Denied");
	}
});

router.delete('/clearmedia/:apikey', function(req, res, next) {
	if (req.params.apikey == process.env.API_KEY) {
		MediaMember.deleteMany({}, function(err, result) {
			if (err) {
				res.json(err);
			}
			else {
				res.json({msg: 'deleted all media members successfully'});
			}
		});
	}
	else {
		res.send("Access Denied");
	}
});

router.post('/users/insert/:apikey', function(req, res) {
	if (req.params.apikey == process.env.API_KEY) {
		var user;
		var newUser;
		var upload;
		( async() => {
			try {
				for (i = 1001; i < 10000; i++) {
					user = "user" + i;
					newUser = new User({
							username: user,
							password: 1
						});
					upload = await newUser.save();
					console.log("new user created successfully");
				}
				res.end();
			}
			catch(err) {
				console.log(err);
			}
		}) ();
	}
	else {
		res.send("Access Denied");
	}
});


module.exports = router;




