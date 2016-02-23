var request = require('request');
var fs = require('fs');
var dateFormat = require('dateformat');
var async = require('async');
var config = require('./config');
var connection = config.connection;
var sendMessage = require('./sendMessage');


var nowStatus;
var transform;
var preStatus;


var host = "http://testserver.tiscservice.com:8080/AiPlugOpenAPI/List";
// var owner = "0932237971";
// var token = "67ec1556dd584c6a5b4be91b4c893ae1";
var owner = "0978388929";						//Kelly
var token = "2bcdb5ebd035194f7ce1777086d3fae1";	//Kelly


var requestURL = host + '?owner=' + owner + '&token=' + token;
// console.log(requestURL)

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

var main = function(){
	request.get(requestURL, function (error,response,body){
		if (error)
			console.log("Error: ", error);
		else{
			var json = JSON.parse(body);

			var dataList = json.data;
			console.log(dataList)
			d = dataList[0]
			// async.each(dataList,function(d,callback){

				//Plug ID
				var mac = d.outletid.substr(6, d.outletid.length-8);
				var currentPower = 0;
				var now = new Date();
				var timestamp = dateFormat(now, 'yyyy-mm-dd HH:MM:ss');
				var dataId = (new Buffer(mac).toString('base64')) + timestamp;

				//Plug Infomations
				var infos = d.attridval.split(",");
				infos.forEach(function (info){
					var i = info.split("_");
					var num = parseInt(i[1]);
					if (i[0] == '5'){
						currentPower = num;
					}
				})
				var querystr = "Select * from plugStatus WHERE `plugID` = '"+mac+"' order by `timestamp` desc limit 2 ";

				connection.query(querystr, function (err, rows){
					if (err)
						console.log("Error: ", err);
					else{

						nowStatus = rows[0].status;
						transform = rows[0].transitionPeriod;
						if (rows[0].period == 0)
							nowPeriod = 1
						else
							nowPeriod = rows[0].period;
						preStatus = rows[1].status;

						console.log(currentPower)
						
						var queryString;
						//Transform period
						if (transform > 0){
							if (!inStatus(currentPower, nowStatus)){
								//incident happended recovery to previous
								queryString = "DELETE FROM plugStatus WHERE `transitionPeriod` > 0 ";
								connection.query(queryString, function (err, rows){
									if (err)
										console.log(err)
									else
										console.log("意外",timestamp,nowStatus,transform,preStatus,nowPeriod)
								});
							}else{
								transform = 0;
								queryString = "UPDATE plugStatus SET `transitionPeriod` = ? WHERE `transitionPeriod` > 0 ";
								if (nowStatus == 'inWater' && nowPeriod == 1)
									sendMessage(["+886978388929"],"StartWashing");
								else if (nowStatus == 'idle' && nowPeriod == 1)
									sendFinishNotice(mac);
								connection.query(queryString, [transform],function (err, rows){
									if (err)
										console.log(err)
									else
										console.log("確定改變",timestamp, nowStatus,transform,preStatus,nowPeriod)
								});
							} 
						}else{
							//change to another status or incident happened
							if (!inStatus(currentPower, nowStatus)){
								preStatus = nowStatus;
								transform += 1;
								if (nowStatus == 'drying'){
									if (inStatus(currentPower, machineStatus[nowStatus].next[0])){
										nowPeriod += 1;
										nowStatus = machineStatus[nowStatus].next[0];
									}else{
										nowPeriod = 0;
										nowStatus = machineStatus[nowStatus].next[1];
									}
								}else
									nowStatus = machineStatus[nowStatus].next;

								queryString = "Insert into plugStatus SET `id`= ? , `plugID`= ?, `timestamp`= ?, `status`= ?, `transitionPeriod`= ?, `Period` = ?";
								connection.query(queryString, [dataId, mac, timestamp, nowStatus, 1, nowPeriod],function (err, rows){
									if (err)
										console.log(err)
									else
										console.log("變動",timestamp,nowStatus,transform,preStatus,nowPeriod)
								});
								
							}else{
								console.log("不變",timestamp,nowStatus,transform,preStatus,nowPeriod)
							}
						}
					}
				})
			
		}
	})

}

function inStatus(power ,status){
	var statusPower = machineStatus[status].power
	if ((Math.abs(power - statusPower) / statusPower) < 0.3)
		return true;
	else if (status == 'idle')
		return power < statusPower;
	else
		return false;
}

function sendFinishNotice(macID){
	var querystr = "SELECT * FROM subscription INNER JOIN user ON subscription.userEmail=user.email WHERE `finish` = 0 AND machineID = ?";
	var users = [];
	connection.query(querystr, [macID], function(err, rows){
		if (rows.length > 0){
			rows.forEach(function(row,index){
				users.push(row.phone)
				sendMessage(users,"Washing Machine Finished");
			})
		}else{
			console.log("no user subscript")
		}
	})
	console.log(users)
}

if (require.main === module) {
	main();
}

module.exports = main;


