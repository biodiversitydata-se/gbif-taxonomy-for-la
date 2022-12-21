const { parse } = require("csv-parse");
const { stringify } = require('csv-stringify');

const parser = parse({
  quote: null,
  delimiter: '\t'
});

const stringifier = stringify({
  quote: null,
  delimiter: '\t'
});

// https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
function escapeRegex(string) {
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
}


function taxonTransform(record, stats = { authorWithQuote: 0, scientifiNameWithUnderscore: 0, splitted: 0, total: 0 }) {
  const hasAuthor = record[6].length > 0;
  const hasCanonicalName = record[7].length > 0;
  const noSciName = record[5].length === 0;
  const sameSciNameAndCanonical = record[5] === record[7];
  const origAuthor = record[6];
  const origRecord = [...record];
  stats.total++;
  if (hasAuthor) {
    if (hasCanonicalName) {
      // Try to remove it from scientifiName
      if (record[5].endsWith(" " + record[6])) {
        // name[space]author
        record[5] = record[5].replace(new RegExp(" " + escapeRegex(record[6]) + '$'), '');
        stats.splitted++;
      } else if (record[5].endsWith("_" + record[6])) {
        // name_author
        record[5] = record[5].replace(new RegExp("_" + escapeRegex(record[6]) + '$'), '');
        stats.scientifiNameWithUnderscore++
        stats.splitted++;
      } else if (record[5].startsWith(record[7] + ", ")) {
        // 'name, author'
        record[6] = record[5].replace(record[7] + ", ", "");
        record[5] = record[7];
        stats.authorWithQuote++;
        stats.splitted++;
        stringifier.write(origRecord.concat([ "AUTHOR_STARS_WITH_QUOTE" ]));
      } else if (record[5].endsWith(" " + record[6].replace(/ , /, ", "))) {
        // name[space],[space]author
        record[5] = record[5].replace(new RegExp(" " + escapeRegex(record[6].replace(/ , /, ", ")) + '$'), '');
        record[6] = record[6].replace(/ , /, ", ");
        stats.splitted++;
      } else if (record[5].startsWith(record[7])) {
        // Let's try to use cannonical name (this will not work for subsp., var., f., nothosubsp. y nothovar.)
        record[5] = record[7];
        // stats??
      }
    } else {
      // no canonicalName so we try to remove author from sciName if it's there
      stringifier.write(origRecord.concat([ "NO_CANONICAL" ]));
    }
  }
  if (record[5].length === 0) {
    // And this is mandatory, see
    // https://github.com/AtlasOfLivingAustralia/documentation/wiki/Troubleshooting#null-has-been-blacklisted-error
    stringifier.write(origRecord.concat([ "WRONG_SCIENTIFIC_NAME" ]));
    process.exit(1);
  }
  return record;
}

module.exports = { taxonTransform, parser, stringifier };
