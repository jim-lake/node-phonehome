'use strict';

const os = require('os');
const _ = require('lodash');
const request = require('request');

function send(url,done) {
  if (!done) {
    done = function() {};
  }

  const networkInterfaces = os.networkInterfaces();

  const address_list = [];
  _.each(networkInterfaces,(list,name) => {
    _.each(list,(address) => {
      if (!address.internal) {
        const a = _.extend({},address,{
          interface: name,
        });
        address_list.push(a);
      }
    });
  });

  const cpus = os.cpus();
  const cpu_module = cpus && cpus.length > 0 && cpus[0].model ? cpus[0].model : "";

  const data = {
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    release: os.release(),
    cpu_module,
    address_list,
    uptime: os.uptime(),
    loadavg: os.loadavg(),
  };

  const opts = {
    url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    followAllRedirects: true,
    body: JSON.stringify(data),
  };

  request(opts,(err,res,body) => {
    if (!err && (res.statusCode < 200 || res.statusCode >= 300)) {
      err = 'status_code';
    }
    done(err,res,body);
  });
}

module.exports = send;
