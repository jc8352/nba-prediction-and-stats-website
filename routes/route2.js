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

router.post('/users/creategame', function(req, res) {
	UserGames.create({gameID: 1, 
		player1: {username: 'jc8352', rating: 1200},
		player2: {username: 'lc', rating: 1200},
		numtakes: 'unlimited',
		date: new Date(),
		length: 1
	}, function (err, result) {
		if (err) {
			res.send(err);
		}
		else {
			res.send("inserted successfully");
		}
	});
});

router.get('/usergames/get', function(req, res) {
	UserGames.find(function(err, result) {
		if (err) {
			res.send(err);
		}
		else {
			res.send(result);
		}
	});
});


module.exports = router;