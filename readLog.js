var logs = [];

var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('jlog/logger.log')
});

var readLogs = async function(){
  await lineReader.on('line', (line) => {
    var ob = JSON.parse(line);
    logs.push(ob);
  });
}
readLogs();

console.log(logs);
