const express = require('express');
const router = express.Router();

const Take = require('../models/takes');
const MediaMember = require('../models/mediamembers');

//router.use(express.static('public'));

router.get('/:id', function(req, res, next) {
	MediaMember.findById({_id: req.params.id}, function(err, media_pf) {
		if (err) {
			res.json(err);
		}
		else {
			if (req.session.user) {
				res.render('media_profiles', {media_member: media_pf, user_info: req.session.user});
			}
			else {
				res.render('media_profiles', {media_member: media_pf, user_info: false});
			}
		}
	});
});

module.exports = router;
