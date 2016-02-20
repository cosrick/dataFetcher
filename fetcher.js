var request = require('request');
var fs = require('fs');
var dateFormat = require('dateformat');
var config = require('./config');
var connection = config.connection;

var host = "http://testserver.tiscservice.com:8080/AiPlugOpenAPI/List";
// var owner = "0932237971";
// var token = "67ec1556dd584c6a5b4be91b4c893ae1";
var owner = "0978388929";						//Kelly
var token = "2bcdb5ebd035194f7ce1777086d3fae1";	//Kelly

var main = function(){

	// checkStatus("20F85EA96EE0", 123)

	var requestURL = host + '?owner=' + owner + '&token=' + token;
	console.log(requestURL)

	request.get(requestURL, function (error,response,body){
		if (error)
			console.log("Error: ", error);
		else{
			var json = JSON.parse(body);

			var dataList = json.data;
			dataList.forEach(function (d){
				console.log(d)

				var item = new Object();

				//Plug ID
				var mac = d.outletid.substr(6, d.outletid.length-8);
				item.ID = mac;
				var now = new Date()
				item.timestamp = dateFormat(now, 'yyyy-mm-dd HH:MM:ss');

				//Plug Infomations
				var infos = d.attridval.split(",");
				infos.forEach(function (info){
					var i = info.split("_");
					var num = parseInt(i[1]);
					if (i[0] == '2'){
						item.currentA = num;
					}else if (i[0] == '5'){
						item.currentPower = num;
					}else if (i[0] == '7'){
						item.energy = num;
					}else if (i[0] == '12'){
						item.powerOn = num;
					}
				})

				var newinfo = JSON.stringify(item) + '\n';

				fs.appendFile('resultR.txt', newinfo, {flags: 'wx'}, function (err){
					if (err)
						console.log("Write File Error: ", err);
					console.log("Saved!!!");
				});

				var dataId = (new Buffer(item.ID).toString('base64')) + item.timestamp;
				console.log(dataId)
				var querystr = "INSERT INTO plugData SET id = ?, plugID = ?, timestamp = ?, currentA = ?, currentPower = ?, energy = ?";

				connection.query(querystr, [dataId, mac, now, item.currentA, item.currentPower, item.energy], function (err, rows){
					if (err)
						console.log("Error: ", err);
					else
						console.log("Saved!!");

				})



			});
			
		}
	})
	// fs.readFile('resultK.txt', function (err,data){
	// 	if (err)
	// 		console.log("Write File Error: ", err);
	// 	data = data.toString('utf8');
	// 	var infos = data.split('\n')
	// 	infos.forEach(function(info,index){
	// 		if (index < 10){
	// 			var item = JSON.parse(info);
	// 			var dataId = (new Buffer(item.ID).toString('base64')) + item.timestamp;
	// 			console.log(dataId)
	// 			var querystr = "INSERT INTO plugData SET id = ?, plugID = ?, timestamp = ?, currentA = ?, currentPower = ?, energy = ?";

	// 			connection.query(querystr, [dataId, item.ID, item.timestamp, item.currentA, item.currentPower, item.energy], function (err, rows){
	// 				if (err)
	// 					console.log("Error: ", err);
	// 				else
	// 					console.log(rows)
	// 					console.log("Saved!!");

	// 			})
	// 		}

	// 	})		
	// 	// console.log("Saved!!!");
	// });



}

if (require.main === module) {
	main();
}

function checkStatus(macID, newPower){
	var querystr = "Select * from plugStatus ORDER BY `timestamp` desc Limit 1"
	var preStatus;
	var prePower = 0;
	var statusHasChanged = false;
	var nowStatus;

	connection.query(querystr, function (err, rows){
		if (err)
			console.log("Error: ", err);

		preStatus = rows[0].status;
		prePower = rows[0].currentPower;

		if ((newPower == 0) && (prePower == 0)){
			statusHasChanged = false
		}else{
			if ((abs(newPower - prePower) / max(newPower, prePower)) > 0.3){
				statusHasChanged = true;
				nowStatus = nextStep[preStatus];
			}
		}

		if (statusHasChanged){
			console.log("Has Change");
		}else{
			console.log("Not Change");
		}
		

		connection.end()


	})
}


module.exports = main;
