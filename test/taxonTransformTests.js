const waitOn = require("wait-on");
const assert = require("assert");
const { taxonTransform, parser, stringifier } = require("../taxonTransform.js");
const { parse } = require("csv-parse/sync");
const { log } = console;
const fs = require('fs');
const kill = require('tree-kill');
const { exec } = require('child_process');
const axios = require('axios');

const taxonFile = process.env.TAXON_FILE;

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

let serviceProcess = null;

before(function(done) {
  this.timeout(60000);

  serviceProcess = exec("java -jar /data/ala-namematching-server.jar server /data/config.yml");

  serviceProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  serviceProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  serviceProcess.on('error', (error) => {
    console.error(`Error starting service: ${error}`);
  });

  waitOn({
    resources: ["http://localhost:9179"],
    delay: 10000,
    timeout: 30000,
  }, err => {
    if (err) {
      console.error(`Error waiting for service: ${err}`);
      return done(err);
    }
    console.log("Namematching service ready");
    done(); 
  });
});

after(function() {
  if (serviceProcess) {
    kill(serviceProcess.pid); 
    console.log("Service process terminated");
  }
});

describe("Check basic taxon scientificName and scientificNameAuthorship transform", function() {

  describe("taxon.tsv checking", function() {
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
      grepName("Anaerofustis stercorihominis A", function(line) {
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

  describe("scientificName and scientificNameAuthorshipe split Agrotis segetum (Denis & Schiffermüller), 1775", function() {
    it("should return correct splitted", function(done) {
      grepName("Agrotis segetum (Denis", function(line) {
        const record = taxonTransform(parse(line, {quote: null, delimiter: '\t'})[0]);
        assert.equal(record[5], "Agrotis segetum");
        assert.equal(record[6], "(Denis & Schiffermüller), 1775");
        done();
      });
    });
  });

  describe("scientificName and scientificNameAuthorshipe split Nitella mucronata var. robustior", function() {
    it("should return correct splitted", function(done) {
      grepName("Nitella mucronata var. robustior", function(line) {
        const record = taxonTransform(parse(line, {quote: null, delimiter: '\t'})[0]);
        assert.equal(record[5], "Nitella mucronata var. robustior");
        assert.equal(record[6], "A.Braun, 1867");
        done();
      });
    });
  });

  describe("scientificName and scientificNameAuthorshipe split Nitella mucronata f. heteromorpha Fil.", function() {
    it("should return correct splitted", function(done) {
      grepName("Nitella mucronata f. heteromorpha", function(line) {
        const record = taxonTransform(parse(line, {quote: null, delimiter: '\t'})[0]);
        assert.equal(record[5], "Nitella mucronata f. heteromorpha");
        assert.equal(record[6], "Fil.");
        done();
      });
    });
  });

  describe("scientificName and scientificNameAuthorshipe split Claroideoglomus luteum", function() {
    it("should return correct splitted ", function(done) {
      grepName("Claroideoglomus luteum", function(line) {
        const record = taxonTransform(parse(line, {quote: null, delimiter: '\t'})[0]);
        assert.equal(record[5], "Claroideoglomus luteum");
        assert.equal(record[6], "(L.J.Kenn., J.C.Stutz & J.B.Morton) C.Walker & A.Schüßler");
        done();
      });
    });
  });

  describe("scientificName and scientificNameAuthorshipe split Pacispora scintillans (S.L.Rose & Trappe)", function() {
    it("should return correct splitted", function(done) {
      grepName("Pacispora scintillans (S.L.Rose & Trappe", function(line) {
        const record = taxonTransform(parse(line, {quote: null, delimiter: '\t'})[0]);
        assert.equal(record[5], "Pacispora scintillans");
        assert.equal(record[6], "(S.L.Rose & Trappe) Sieverd. & Oehl");
        done();
      });
    });
  });

  describe("scientificName and scientificNameAuthorshipe split Leucanthemum gayanum subsp. demnatense (Murb.), 1939", function() {
    it("should return correct splitted ", function(done) {
      grepName("Leucanthemum gayanum subsp. demnatense", function(line) {
        const record = taxonTransform(parse(line, {quote: null, delimiter: '\t'})[0]);
        assert.equal(record[5], "Leucanthemum gayanum subsp. demnatense");
        assert.equal(record[6], "(Murb.), 1939");
        done();
      });
    });
  });

  describe("scientificName and scientificNameAuthorshipe split Silene vulgaris f. vulgaris", function() {
    it("should return correct splitted ", function(done) {
      grepName("Silene vulgaris f. vulgaris", function(line) {
        const record = taxonTransform(parse(line, {quote: null, delimiter: '\t'})[0]);
        assert.equal(record[5], "Silene vulgaris f. vulgaris");
        assert.equal(record[6], "");
        done();
      });
    });
  });

  describe("scientificName and scientificNameAuthorshipe split Hippomarathrum montanum subsp. montanum", function() {
    it("should return correct splitted ", function(done) {
      grepName("Hippomarathrum montanum subsp. polyphyllum", function(line) {
        const record = taxonTransform(parse(line, {quote: null, delimiter: '\t'})[0]);
        assert.equal(record[5], "Hippomarathrum montanum subsp. polyphyllum");
        assert.equal(record[6], "(Ten.)");
        done();
      });
    });
  });

  describe("scientificName and scientificNameAuthorshipe split Leucanthemum gayanum subsp. demnatense", function() {
    it("should return correct splitted ", function(done) {
      grepName("Leucanthemum gayanum subsp. demnatense", function(line) {
        const record = taxonTransform(parse(line, {quote: null, delimiter: '\t'})[0]);
        assert.equal(record[5], "Leucanthemum gayanum subsp. demnatense");
        assert.equal(record[6], "(Murb.), 1939");
        done();
      });
    });
  });

  describe("scientificName and scientificNameAuthorshipe split Erucastrum nasturtiifolium subsp. nasturtiifolium", function() {
    it("should return correct splitted", function(done) {
      grepName("Erucastrum nasturtiifolium subsp. nasturtiifolium", function(line) {
        const record = taxonTransform(parse(line, {quote: null, delimiter: '\t'})[0]);
        assert.equal(record[5], "Erucastrum nasturtiifolium subsp. nasturtiifolium");
        assert.equal(record[6], "");
        done();
      });
    });
  });

  describe('namematching homonym Test', function() {
    it('should return the expected response for query Oenanthe', async function() {
      const response = await axios.get('http://localhost:9179/api/search?q=Oenanthe');
      const expectedResponse = {
        "success": false,
        "nameType": "SCIENTIFIC",
        "issues": ["homonym"]
      };

      assert.deepEqual(response.data, expectedResponse);
    });
  });


  describe('API Search for Cenchrus setaceus', function() {
    it('should return the correct data for Cenchrus setaceus', async function() {
      const response = await axios.get('http://localhost:9179/api/search?q=Cenchrus%20setaceus');
    
      assert.equal(response.data.success, true);
      assert.equal(response.data.scientificName, "Cenchrus setaceus");
      assert.equal(response.data.scientificNameAuthorship, "(Forssk.) Morrone");
      assert.equal(response.data.taxonConceptID, "5828232");
    });
  });

}); 

