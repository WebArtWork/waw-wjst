var mongoose = require('mongoose');
var Schema = mongoose.Schema({
	domain: String,
	title: String,
	description: String,
	thumb: String,
	keywords: String,
	page: String,
	url: String,
	url: {type: String, unique: true, sparse: true, trim: true}
});

Schema.methods.create = function(obj, user, sd) {
	this.domain = obj.domain;
	this.title = obj.title;
	this.description = obj.description;
	this.thumb = obj.thumb;
	this.keywords = obj.keywords;
	this.page = obj.page;
	this.url = obj.url;
}

module.exports = mongoose.model('Serve', Schema);