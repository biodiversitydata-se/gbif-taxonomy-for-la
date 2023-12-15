const { transform } = require('stream-transform');

const fs = require('fs');
const { taxonTransform, parser, stringifier } = require("./taxonTransform.js");

var inputFile = process.argv[2];
var issuesFile = process.argv[3];

var readStream = fs.createReadStream(inputFile);
var issuesStream = fs.createWriteStream(issuesFile);

Object.defineProperty(String.prototype, 'capitalize', {
  value: function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  },
  enumerable: false
});

const issues = [];
stringifier.on('readable', function(){
  let row;
  while((row = stringifier.read()) !== null){
    issues.push(row);
  }
});
// Catch any error in issues pipe
stringifier.on('error', function(err){
  error(err.message);
});
// When finished
stringifier.on('finish', function(){  });

// Write records to the stream
stringifier.pipe(issuesStream);

var atFirstLine = true;

var stats = { authorWithQuote: 0, scientifiNameWithUnderscore: 0, splitted: 0, total: 0 }

const transformer = transform(function(record) {
  if (atFirstLine) {
    // we skip the first line
    atFirstLine = false;
    stringifier.write(record.concat([ "Issue" ]));
  } else {
    record = taxonTransform(record, stats);
  }
  return record.join('\t')+'\n';
});

readStream.on('open', function () {
  readStream.pipe(parser).pipe(transformer).pipe(process.stdout); // taxonResultStream); //
});

readStream.on('end', () => {
  console.error(JSON.stringify(stats));
});

readStream.on('error', function(err) {
  error(err);
  stringifier.end();
  readStream.destroy();
  //  readStream.end(err);
});
