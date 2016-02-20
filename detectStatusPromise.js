var db = require('mysql2-promise')();

db.configure({
    "host":'127.0.0.1',
    "user": 'root',
    "password": 'xu',
    "database": 'washing_machine'
});

var request = require('request');
var fs = require('fs');
var dateFormat = require('dateformat');
var async = require('async');
var config = require('./config');
var connection = config.connection;
var q = require('q');

var nowStatus;
var transform;
var preStatus;

var host = "http://testserver.tiscservice.com:8080/AiPlugOpenAPI/List";
// var owner = "0932237971";
// var token = "67ec1556dd584c6a5b4be91b4c893ae1";
var owner = "0978388929";						//Kelly
var token = "2bcdb5ebd035194f7ce1777086d3fae1";	//Kelly


var machineStatus = {
	'idle': {
		power: 640,
		next: 'inWater'
	},
	'inWater': {
		power: 1400,
		next: 'washing'
	},
	'washing': {
		power: 55000,
		next: 'outWater'
	},
	'outWater': {
		power: 30000,
		next: 'drying'
	},
	'drying': {
		power: 51000,
		next: ['inWater','idle']
	}
}

// request.get(requestURL, function (error,response,body){
// 	if (error)
// 		console.log("Error: ", error);
// 	else{
// 		var json = JSON.parse(body);

// 		var dataList = json.data;
		
// 		async.each(dataList,function(d,callback){
// 			console.log(d)

// 			//Plug ID
// 			var mac = d.outletid.substr(6, d.outletid.length-8);
// 			var currentPower = 0;
// 			var now = new Date();
// 			var timestamp = dateFormat(now, 'yyyy-mm-dd HH:MM:ss');
// 			var dataId = (new Buffer(mac).toString('base64')) + timestamp;

// 			//Plug Infomations
// 			var infos = d.attridval.split(",");
// 			infos.forEach(function (info){
// 				var i = info.split("_");
// 				var num = parseInt(i[1]);
// 				if (i[0] == '7'){
// 					currentPower = num;
// 				}
// 			})
			// var querystr = "Select * from plugStatus WHERE `plugID` = "+mac+" order by `timestamp` limit 2 ";

			// connection.query(querystr, function (err, rows){
			// 	if (err)
			// 		console.log("Error: ", err);
			// 	else{
			// 		console.log(rows);

			// 		nowStatus = rows[0].status;
			// 		transform = rows[0].transitionPeriod;
			// 		preStatus = rows[1].status;
					
			// 		var queryString;
			// 		//Transform period
			// 		if (transform > 0){
			// 			if (!inStatus(currentPower, nowStatus)){
			// 				//incident happended recovery to previous
			// 				queryString = "DELETE * FROM plugStatus WHERE `transitionPeriod` > 0 ";
			// 				connection.query(queryString, function (err, rows){
			// 					if (err)
			// 						callback(err);
			// 					else
			// 						callback();
			// 				});
			// 			}else{
			// 				if (transform == 1){
			// 					transform += 1;
			// 				}else
			// 					transform = 0;
			// 				queryString = "UPDATE plugStatus SET `transitionPeriod` = ? WHERE `transitionPeriod` > 0 ";
			// 				connection.query(queryString, [transform],function (err, rows){
			// 					if (err)
			// 						callback(err);
			// 					else
			// 						callback();
			// 				});
			// 			} 
			// 		}else{
			// 			//change to another status or incident happened
			// 			if (!inStatus(currentPower, nowStatus)){
			// 				preStatus = nowStatus;
			// 				transform += 1;
			// 				if (nowStatus == 'drying'){
			// 					if (inStatus(currentPower, machineStatus[nowStatus].next[0]))
			// 						nowStatus = machineStatus[nowStatus].next[0];
			// 					else
			// 						nowStatus = machineStatus[nowStatus].next[1];
			// 				}else
			// 					nowStatus = machineStatus[nowStatus].next;

			// 				queryString = "Insert into plugStatus SET `id`= ? , `plugID`= ?, `timestamp`= ?, `status`= ?, `transitionPeriod`= ?";
			// 				connection.query(queryString, [dataId, mac, timestamp, nowStatus, 0],function (err, rows){
			// 					if (err)
			// 						callback(err);
			// 					else
			// 						callback();
			// 				});
							
			// 			}else{
			// 				callback()
			// 			}
			// 		}
			// 	}
			// })
// 		},function(err){
// 			if (err)
// 				console.log(err);
// 		})
		
// 	}
// })


function inStatus(power ,status){
	var statusPower = machineStatus[status].power
	if ((Math.abs(power - statusPower) / statusPower) < 0.4)
		return true;
	else if (status == 'idle')
		return power < statusPower;
	else
		return false;
}


fs.readFile('testData.txt', function (err,data){
	if (err)
		console.log("Write File Error: ", err);
	data = data.toString('utf8');
	var infos = data.split('\r');
	var index = -1;

	async.each(infos, function(info, callback){

		index += 1;
		var nowTime = '';
		var currentPower = 0;
		var mac = '';
		var timestamp = '';
		var dataId = '';
		if ((index % 3 == 1) && index < 750){
			details = info.split('\t');
			timestamp = details[0].substr(16, details[0].length);
			mac = details[1];
			currentPower = parseInt(details[4]);
			dataId = (new Buffer(mac).toString('base64')) + timestamp;

			GetInfo().then(function(rows){
				nowStatus = rows[0].status;
				transform = rows[0].transitionPeriod;
				preStatus = rows[1].status;
				console.log(nowStatus)
				
				var queryString;
				//Transform period
				if (transform > 0){
					if (!inStatus(currentPower, nowStatus)){
						//incident happended recovery to previous
						queryString = "DELETE * FROM plugStatus WHERE `transitionPeriod` > 0 ";
						return db.query(queryString).spread(function(err){
							if (err)
								callback("444", err);
							else
								callback();
						})
					}else{
						if (transform == 1){
							transform += 1;
						}else
							transform = 0;
						queryString = "UPDATE plugStatus SET `transitionPeriod` = ? WHERE `transitionPeriod` > 0 ";
						return db.query(queryString, [transform]).spread(function(err){
							if (err)
								callback("222", err);
							else
								callback();
						})
					} 
				}else{
					//change to another status or incident happened
					if (!inStatus(currentPower, nowStatus)){
						preStatus = nowStatus;
						transform += 1;
						if (nowStatus == 'drying'){
							if (inStatus(currentPower, machineStatus[nowStatus].next[0]))
								nowStatus = machineStatus[nowStatus].next[0];
							else
								nowStatus = machineStatus[nowStatus].next[1];
						}else
							nowStatus = machineStatus[nowStatus].next;

						queryString = "Insert into plugStatus SET `id`= ? , `plugID`= ?, `timestamp`= ?, `status`= ?, `transitionPeriod`= ?";
						return db.query(queryString, [dataId, mac, timestamp, nowStatus, 0]).spread(function(err,rows){
							if (err)
								callback(err);
							else
								callback();
						})
						
					}else{
						callback()
					}
				}
			})
		}else
			callback();

	}, function(err){
		if (err)
			console.log("Hii", err);
		else
			connection.end();
	})
			
});

function GetInfo(){
	var deferred = q.defer()
	var querystr = "Select * from plugStatus WHERE `plugID` = '20F85EA97363' order by `timestamp` limit 2 ";
	connection.query(querystr, function(err, rows){
		if (err) deferred.reject(err) // rejects the promise with `er` as the reason
		else deferred.resolve(rows) // fulfills the promise with `data` as the value
	})

	return deferred.promise.nodeify() 
}




