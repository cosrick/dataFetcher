var client = require('twilio')('AC365e6f9a12935f53772ffb4cbd9f064e', '4f85653128f97f54dfdddf2f38494fc9');
var dateFormat = require('dateformat');
var async = require('async');

var main = function(users, Message){
    var now = new Date()

    now.setHours(now.getHours() + (now.getTimezoneOffset() + 8*60) / 60);
    var timestamp = dateFormat(now, "yyyy/mm/dd HH:MM:ss");
    async.each(users,function(user,callback){
        client.sendMessage({

            to:user, // Any number Twilio can deliver to
            from: '+12019776421', // A number you bought from Twilio and can use for outbound communication
            body: timestamp + ' ' + Message // body of the SMS message

        }, function(err, responseData) { //this function is executed when a response is received from Twilio

            if (!err) { 

                console.log(responseData.from); // outputs "+14506667788"
                console.log(responseData.body); // outputs "word to your mother."
                callback();

            }else{
                callback(err);
            }
        });

    },function(err){
        if (err)
            console.log(err);
        else
            console.log("send to: ", users);
    })
    
}

if (require.main === module) {
    main(["+886932237971"],"TestMessage");
}

module.exports = main;