var CronJob = require('cron').CronJob;

var dataFetcher = require('./fetcher');
var timeZone = "Asia/Taipei";

new CronJob('*/10 *  * * * *', function () { dataFetcher() }, null, true, timeZone);