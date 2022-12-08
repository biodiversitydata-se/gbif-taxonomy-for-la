# gbif-taxonomy-for-la

Utilities to adapt the GBIF Backbone Taxonomy for it usage by LA portals

## Introduction

This is a set of utilities to convert the GBIF Backbone Taxonony for it usage by LA portals. This consist in:
- Separate scientificName and scientificNameAuthorship
- Detect issues during this convertion that can be reported back to GBIF
- Workaround for some issues in the taxonomy that prevent the nameindexer to work properly
- Generate lucene 6 and lucene 8 indexes for us by LA portals (for nameindexer, namematching-service and sensitive-data-service)
- Generate the modified dwca for bie-index

The resulting indexes are published in updated LA ansible inventories, so in general you can use them without the need to run this repository.

## Dependencies

To run this you'll need to install first: 

- [dopopts](https://github.com/docopt/docopts)
- legacy nameindexer playbook executed in the server you'll use. So  /data/lucene should exists
- node/npm
- tar
- zip
- mocha for testing

## Usage

`gbif-taxonomy-for-la --help`

`gbif-taxonomy-for-la --backbone --name-authors  --namematching-index --namematching-index-legacy 2022-11-23`

`gbif-taxonomy-for-la --namematching-index --namematching-index-legacy 2022-11-23`

## Tests

Just run `mocha`.

## Contributing

If you detect some extra issue Pull Request welcome.
