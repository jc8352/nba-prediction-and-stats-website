//importing modules
require('dotenv').config();
var express = require('express');
var mongoose = require('mongoose');
var bodyparser = require('body-parser');
var cars = require('cars');
var path = require('path');
var fs = require('fs');
const session = require('express-session');
var CronJob = require('cron').CronJob;
const axios = require('axios');
const https = require('https');

var app = express();

// register view engine
app.set('view engine', 'ejs');

const route = require('./routes/route');
const media = require('./routes/media');
const users = require('./routes/users');
const charts = require('./routes/charts');
const stats = require('./routes/stats');
const route2 = require('./routes/route2');

const User = require('./models/accounts');

//Connect to mongodb
mongoose.connect(process.env.DB);

//on connection
mongoose.connection.on('connected', function() {
	console.log('Connected to database mongodb @27017');
});

mongoose.connection.on('error', function(err) {
	if (err) {
		console.log('Error in database connection: ' + err);
	}
});

//port #
const port = process.env.PORT || 3000;

app.use(bodyparser.json());
app.use(session({secret: process.env.SESSION_SECRET, saveUninitialized: true, resave: true}));

app.use(express.static('public'));

//routes
app.use('/api', route);
app.use('/media', media);
app.use('/users', users);
app.use('/charts', charts);
app.use('/stats', stats);
app.use('/api2', route2);

global.updatedGames = [];
global.updatedGamesIds_Stats = [];
global.totalGames = null;
global.statsUpdatesDone = false;

var getTipicoOdds = new CronJob (
	'0 0 0 * * *',
	function() {
		(async () => {
			try {
				const response = await axios('http://localhost:'+port+'/api/odds/'+process.env.API_KEY);
				console.log("response successfully acquired from tipico");
			} catch(err) {
				console.log(err);
			}
		}) ();
		console.log('Tipico Takes successfully updated: ' + new Date());
		console.log(updatedGames);
		updatedGames = [];
	},
	null,
	true,
	'America/Los_Angeles'
);

var updateTakes = new CronJob (
	'0 10,40 18-22 * JAN-JUN,OCT-DEC *',
	function() {
		(async () => {
			try {
				if (updatedGames.length != totalGames) {
					const response = await axios('http://localhost:'+port+'/api/users/update/'+process.env.API_KEY);
					console.log("not all games have been updated");
				}
				else {console.log("all games for the day have been updated");}
			} catch(err) {
				console.log(err);
			}
		}) ();
		console.log('User takes successfully updated: ' + new Date());
	},
	null,
	true,
	'America/Los_Angeles'
);

var todaysGames = new CronJob (
	'0 5 0 * JAN-JUN,OCT-DEC *',
	function() {
		(async() => {
			try {
				const today = new Date();
				const todays_games = await axios('https://uk.global.nba.com/stats2/scores/gamedaystatus.json?gameDate='+today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()+'&locale=en&tz=-8');
				totalGames = todays_games.data.payload.gameDates[0].games.length;
				statsUpdatesDone = false;
				updatedGamesIds_Stats = [];
				console.log("total games today: " + totalGames);
			} catch (err) {
				console.log(err);
			};
		}) ();
	},
	null,
	true,
	'America/Los_Angeles'
);

/*
var updateStats = new CronJob (
	'0 11,41 18-22 * JAN-JUN,OCT-DEC *',
	function() {
		(async() => {
			try {
				const response = await axios('http://localhost:'+port+'/api/stats/update/'+process.env.API_KEY);
				console.log('automatic stats update completed');
			} catch (err) {
				console.log(err);
			};
		}) ();
	},
	null,
	true,
	'America/Los_Angeles'
);*/


const MediaMember = require('./models/mediamembers');
app.get('/', function(req, res) {
	MediaMember.find().sort({money_gain: -1}).exec(function(err, media_stats) {
		if (err) {
			res.json(err);
		}
		else {
			if (req.session.user) {
				//res.render('media_rankings', {stats: media_stats, user: req.session.user});
				res.render('home_page', {stats: media_stats, user: req.session.user});
			}
			else {
				//res.render('media_rankings', {stats: media_stats, user: false});
				res.render('home_page', {stats: media_stats, user: false});
			}
		}
	});

});

app.get('/signup', function(req, res) {
	res.render('signup');
});

app.get('/login', function(req, res) {
	res.render('login');
});

app.get('/logout', function(req, res) {
	req.session.destroy(function() {
		console.log("user logged out");
	});
	res.redirect('/');
});

app.listen(port, function() {
	console.log('server started on port: ' + port);
});





