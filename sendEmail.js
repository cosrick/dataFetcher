var nodemailer = require('nodemailer');
var dateFormat = require('dateformat');

// create reusable transporter object using the default SMTP transport
var smtpTransport = require('nodemailer-smtp-transport');

var transporter = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    auth: {
        user: 'rick830620@gmail.com', // my mail
        pass: 'rick83062'
    }
}));
// var transporter = nodemailer.createTransport('smtps://rick830620%40gmail.com:rick83062@smtp.gmail.com');

// setup e-mail data with unicode symbols
var main = function(sendMessage){
	var timestamp = dateFormat(new Date(), "yyyy/mm/dd HH:MM:ss");

	var mailOptions = {
	    from: 'RickLee <b01705001@ntu.edu.tw>', // sender address
	    to: 'rick830620@gmail.com', // list of receivers
	    subject: 'WashingMachine Notice', // Subject line
	    text: timestamp + ' ' + sendMessage // plaintext body
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, function(error, info){
	    if(error){
	        return console.log(error);
	    }
	    console.log(info);
	    console.log('Message sent: ' + info.response);
	});
}

if (require.main === module) {
	main("testEmail");
}

module.exports = main;