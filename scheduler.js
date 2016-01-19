var CronJob = require('cron').CronJob;

var dataFetcher = require('./fetcher');
var dataFetcherRick = require('./fetcherR');
var timeZone = "Asia/Taipei";

new CronJob('0,10,20,30,40,50 *  * * * *', function () { dataFetcher() }, null, true, timeZone);
new CronJob('5,15,25,35,45,55 *  * * * *', function () { dataFetcherRick() }, null, true, timeZone);