const assert = require("assert");
const { taxonTransform, parser, stringifier } = require("../taxonTransform.js");
const { parse } = require("csv-parse/sync");
const { log } = console;
const fs = require('fs');
const taxonFile = './target/backbone/Taxon.tsv.orig';

const { exec } = require('child_process');

function grep(name, filename, done) {
  exec("grep -m 1 '" + name + "' " + filename, { timeout: 50000 }, (err, stdout) => {
    if (err) return console.log(err);
    // log(stdout);
    done(stdout);
  });
}

function grepName(name, done) {
  grep(name, taxonFile, function(result) {
    return done(result);
  });
}


describe("Check basic taxon scientificName and scientificNameAuthorship transform", function() {

  describe("taxon.txv checking", function() {
    it("taxon.tsv.orig should exist", function() {
      assert.equal(fs.existsSync(taxonFile), true);
    });
  });

  describe("grep exec command should work", function() {
    it("should grep Cenchrus setaceus", function(done) {
      grepName("Cenchrus setaceus (Forssk.) Morrone", function(line) {
        assert.equal(line.length > 0, true);
        done();
      });
    });
  });

  describe("scientificName and scientificNameAuthorshipe split", function() {
    it("should return correct splitted scientific and author with ()", function(done) {
      grepName("Cenchrus setaceus (Forssk.) Morrone", function(line) {
        // log(line);
        const record = taxonTransform(parse(line, {quote: null, delimiter: '\t'})[0]);
        assert.equal(record[5], "Cenchrus setaceus");
        assert.equal(record[6], "(Forssk.) Morrone");
        done();
      });
    });
  });


  describe("scientificName and scientificNameAuthorshipe split", function() {
    it("should return correct splitted Rhopalosiphum Koch, 1854", function(done) {
      grepName("Rhopalosiphum Koch, 1854", function(line) {
        const record = taxonTransform(parse(line, {quote: null, delimiter: '\t'})[0]);
        assert.equal(record[5], "Rhopalosiphum");
        assert.equal(record[6], "Koch, 1854");
        done();
      });
    });
  });

  describe("scientificName and scientificNameAuthorshipe split Striatopollis trochuensis", function() {
    it("should return correct splitted ", function(done) {
      grepName("Striatopollis trochuensis Ward, 1986", function(line) {
        const record = taxonTransform(parse(line, {quote: null, delimiter: '\t'})[0]);
        assert.equal(record[5], "Striatopollis trochuensis");
        assert.equal(record[6], "Ward, 1986");
        done();
      });
    });
  });

  describe("scientificName and scientificNameAuthorshipe split Festuca alpina", function() {
    it("should return correct splitted", function(done) {
      grepName("Festuca alpina", function(line) {
        const record = taxonTransform(parse(line, {quote: null, delimiter: '\t'})[0]);
        assert.equal(record[5], "Festuca alpina");
        assert.equal(record[6], "Suter");
        done();
      });
    });
  });

  describe("scientificName and scientificNameAuthorshipe split Anaerofustis stercorihominis_A", function() {
    it("should return correct splitted", function(done) {
      grepName("Anaerofustis stercorihominis_A", function(line) {
        const record = taxonTransform(parse(line, {quote: null, delimiter: '\t'})[0]);
        assert.equal(record[5], "Anaerofustis stercorihominis");
        assert.equal(record[6], "A");
        done();
      });
    });
  });

  describe("scientificName and scientificNameAuthorshipe split Perciformorum, 1900", function() {
    it("should return correct splitted", function(done) {
      grepName("Perciformorum, 1900", function(line) {
        const record = taxonTransform(parse(line, {quote: null, delimiter: '\t'})[0]);
        assert.equal(record[5], "Perciformorum");
        assert.equal(record[6], "1900");
        done();
      });
    });
  });

  describe("scientificName and scientificNameAuthorshipe split Epialtoides hiltoni (Rathbun, 1923)", function() {
    it("should return correct splitted ", function(done) {
      grepName("Epialtoides hiltoni", function(line) {
        const record = taxonTransform(parse(line, {quote: null, delimiter: '\t'})[0]);
        assert.equal(record[5], "Epialtoides hiltoni");
        assert.equal(record[6], "(Rathbun, 1923)");
        done();
     });
     });
       });
  /*
     describe("scientificName and scientificNameAuthorshipe split ", function() {
     it("should return correct splitted ", function(done) {
     grepName("", function(line) {
     const record = taxonTransform(parse(line, {quote: null, delimiter: '\t'})[0]);
     assert.equal(record[5], "");
     assert.equal(record[6], "");
     done();
     });
     });
     });
   */
}); 

