const express = require('express');
const router = express.Router();

const Tipico = require('../models/tipico');
const UserTake = require('../models/usertakes');
const User = require('../models/accounts');
const FollowLists = require('../models/followers');
const multer = require('multer');
const uuid = require('uuid').v4;
//const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const Jimp = require('jimp');
const AWS = require('aws-sdk');


const storage = multer.memoryStorage();
const upload = multer({storage: storage});

router.get('/', function(req, res) {
	User.find().sort({money_gain: -1}).limit(500).exec(function(err, user_stats) {
		if (err) {
			res.json(err);
		}
		else {
			if (req.session.user) {
				res.render('user_rankings', {stats: user_stats, user: req.session.user});
			}
			else {
				res.render('user_rankings', {stats: user_stats, user: false});
			}
		}
	});
});

router.get('/createtake', function(req, res, next) {
	if (req.session.user) {
		Tipico.find(function(err, tipico_takes) {
			if (err) {
				res.json(err);
			}
			else {
				res.render('newtake', {takes: tipico_takes});
			}
		});
	}
	else {
		res.redirect('/login');
	}
});

router.get('/:id', function(req, res, next) {
	User.findById({_id: req.params.id}, function(err, user_pf) {
		if (err) {
			res.json(err);
		}
		else {
			if (req.session.user) {
				res.render('user_profiles', {user: user_pf, user_info: req.session.user});
			}
			else {
				res.render('user_profiles', {user: user_pf, user_info: false});
			}
		}
	});
});

//router.get('/:id/following')

router.get('/takes/counts', function(req, res) {
	User.aggregate([
		{$unwind: "$takes"}, 
		{$group: {_id: "$takes.take.description", count: {$sum: 1}}},
		{$sort: {count: -1}}
	], function(err, result) {
		res.send(result);
	});
});

router.get('/upload/pfp', function(req, res) {
	if (req.session.user) {
		res.render('upload_pfp');
	}
	else {
		res.redirect('/login');
	}
});

router.get('/:id/followlists', function(req, res) {
	FollowLists.findById({_id: req.params.id}, function(err, follow_info) {
		if (err) {
			res.json(err);
		}
		else {
			if (req.session.user) {
				res.render('follow_lists', {user_follow: follow_info, user_info: req.session.user});
			}
			else {
				res.render('follow_lists', {user_follow: follow_info, user_info: false});
			}
		}
	});
});

router.post('/upload/pfp', upload.single('pfp'), async function(req, res) {
	try {
		const image = req.file;
		const file = await Jimp.read(Buffer.from(image.buffer, 'base64'))
			.then(async image => {
				image.cover(200, 200);
				return image.getBufferAsync(Jimp.AUTO);
			})
			.catch(err => {
				res.status(500).json({ msg: 'Server Error', error: err});
			})
		
		const s3FileURL = process.env.AWS_Uploaded_File_URL_LINK;

		let s3bucket = new AWS.S3({
			accessKeyId: process.env.AWS_ACCESS_KEY_ID,
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
			region: process.env.AWS_REGION
		});

		const image_path = uuid() + '-' + image.originalname;

		const params = {
			Bucket: process.env.AWS_BUCKET_NAME,
			Key: image_path,
			Body: file,
			ContentType: image.mimetype,
			ACL: 'public-read'
		};

		s3bucket.upload(params, async (err, data) => {
			try {
			    if (err) {
			        res.status(500).json({ error: true, Message: err });
			        } else {
			        const newFileUploaded = {
			        	fileLink: s3FileURL + image_path,
			        	s3_key: params.Key
			        };
			        User.findOneAndUpdate({_id: req.session.user.id}, {pfp: image_path/*pfp: req.file.filename*/}, function(err, result) {
						if (err) {
							res.json(err);
						}
						else {
							res.send(req.session.user.id);
						}
					});
			        }
			    } catch (err) {
			       res.status(500).json({ msg: 'Server Error', error: err });
			    }
			});
	} catch (err) {
		res.status(500).json({ msg: 'Server Error', error: err });
	}

});

router.put('/follow', upload.none(), function(req, res) {
	let follow = {username: req.body.username,
				  _id: req.body.followid};
	FollowLists.findOneAndUpdate({_id: req.session.user.id}, 
		{$inc: {totalFollowing: 1}, 
		$push: {following: follow}}, function(err, result) {
			console.log(result);
	});
	User.findOneAndUpdate({_id: req.session.user.id}, {$inc: {following: 1}}, function(err, result) {
		console.log(result);
	});
	let follower = {username: req.session.user.username,
					_id: req.session.user.id};
	FollowLists.findOneAndUpdate({_id: req.body.followid}, 
		{$inc: {totalFollowers: 1},
		 $push: {followers: follower}}, function(err, result) {
		 	console.log(result);
	});
	User.findOneAndUpdate({_id: req.body.followid}, {$inc: {followers: 1}}, function(err, result) {
		console.log(result);
	});
	res.send("follow lists successfully updated");
});

router.put('/unfollow', upload.none(), function(req, res) {
	let unfollow = {username: req.body.username,
				  _id: req.body.unfollowid};
	FollowLists.findOneAndUpdate({_id: req.session.user.id}, 
		{$inc: {totalFollowing: -1}, 
		$pull: {following: unfollow}}, function(err, result) {
			console.log(result);
	});
	User.findOneAndUpdate({_id: req.session.user.id}, {$inc: {following: -1}}, function(err, result) {
		console.log(result);
	});
	let follower = {username: req.session.user.username,
					_id: req.session.user.id};
	FollowLists.findOneAndUpdate({_id: req.body.unfollowid}, 
		{$inc: {totalFollowers: -1},
		 $pull: {followers: follower}}, function(err, result) {
		 	console.log(result);
	});
	User.findOneAndUpdate({_id: req.body.unfollowid}, {$inc: {followers: -1}}, function(err, result) {
		console.log(result);
	});
	res.send("follow lists successfully updated");
});

router.get('/check/following/:currid/:userid', function(req, res) {
	FollowLists.findOne({_id: req.params.currid, "following._id": req.params.userid}, {user: 1}, function(err, result) {
		if (result == null) {
			res.json({found: false});
		}
		else {
			res.json({found: true});
		}
	});

});

module.exports = router;