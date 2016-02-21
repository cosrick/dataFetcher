var mysql = require('mysql');

var config = {};

config.connection = mysql.createConnection({
	host:'127.0.0.1',
	user: 'root',
	password: 'CA',
	database: 'washing_machine'
});

module.exports = config;