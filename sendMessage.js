var client = require('twilio')('AC365e6f9a12935f53772ffb4cbd9f064e', '4f85653128f97f54dfdddf2f38494fc9');
var dateFormat = require('dateformat');

var main = function(Message){
    var timestamp = dateFormat(new Date(), "yyyy/mm/dd HH:MM:ss");

    client.sendMessage({

        to:'+886937526021', // Any number Twilio can deliver to
        from: '+12019776421', // A number you bought from Twilio and can use for outbound communication
        body: timestamp + ' ' + Message // body of the SMS message

    }, function(err, responseData) { //this function is executed when a response is received from Twilio

        if (!err) { // "err" is an error received during the request, if any

            // "responseData" is a JavaScript object containing data received from Twilio.
            // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
            // http://www.twilio.com/docs/api/rest/sending-sms#example-1

            console.log(responseData.from); // outputs "+14506667788"
            console.log(responseData.body); // outputs "word to your mother."

        }else{
            console.log(err);
        }
    });
}

if (require.main === module) {
    main("TestMessage");
}

module.exports = main;