const mongoose = require('mongoose');

const otherUser = {
	username: {
		type: String,
		required: true
	},
	_id: {
		type: String,
		required: true
	}
}

const FollowListsSchema = {
	user: {
		type: String,
		required: true
	},
	_id: {
		type: String,
		required: true
	},
	totalFollowers: {
		type: Number,
		default: 0
	},
	totalFollowing: {
		type: Number,
		default: 0
	},
	followers: [{
		type: otherUser
	}],
	following: [{
		type: otherUser
	}]
}

const FollowLists = module.exports = mongoose.model('FollowLists', FollowListsSchema);