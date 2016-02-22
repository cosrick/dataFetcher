var CronJob = require('cron').CronJob;

var dataFetcher = require('./fetcher');
var dataFetcherRick = require('./fetcherR');
var detecter = require('./detectStatus');
var detecterR = require('./detectStatusR');
var timeZone = "Asia/Taipei";

// new CronJob('0,10,20,30,40,50 *  * * * *', function () { dataFetcher() }, null, true, timeZone);
// new CronJob('0,10,20,30,40,50 *  * * * *', function () { dataFetcher() }, null, true, timeZone);
new CronJob('0,30 *  * * * *', function () { detecter() }, null, true, timeZone);
new CronJob('15,40 *  * * * *', function () { detecterR() }, null, true, timeZone);