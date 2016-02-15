#!/usr/bin/env node
'use strict';

const path = require('path');

const phonehome = require('./index.js');

const argv = process.argv.slice(1);

function usage() {
  console.log("Usage: " + path.basename(argv[0]) + " <phonehome url>");
  console.log("");
}

if (argv.length < 2) {
  usage();
  process.exit(-1);
}

const url = argv[1];

phonehome(url,(err,response,body) => {
  if (err == 'status_code') {
    console.error("Unexpected status code:",response.statusCode);
    process.exit(-3);
  } if (err) {
    console.error("Failed to phonehome with error:",err);
    process.exit(-2);
  } else {
    console.log("Sent successfully.");
    process.exit(0);
  }
});

