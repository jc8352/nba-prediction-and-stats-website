const express = require('express');
const router = express.Router();

const HistoricalOdds = require('../models/historicalOdds');

router.get('/', function(req, res) {
	HistoricalOdds.find({$and: [{take: {$ne: "NBA 2022/23 - To Make Eastern Conference Play-In Tournament"}}, {take: {$ne: "NBA 2022/23 - To Make Western Conference Play-In Tournament"}}]}, {take: 1, _id: 1}, function(err, takes_list) {
		if (err) {
			res.send(err);
		}
		else {
			if (req.session.user) {
				res.render('charts', {takes: takes_list, user: req.session.user});
			}
			else {
				res.render('charts', {takes: takes_list, user: false});
			}
		}
	});
});

module.exports = router;