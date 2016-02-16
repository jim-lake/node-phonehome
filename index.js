'use strict';

const os = require('os');
const _ = require('lodash');
const request = require('request');

const PRIMARY_INTERFACE_LIST = ['eth0','en0','wlan0','wi0'];

function get_first_property(ni_list,filter) {
  let value = false;

  _.any(PRIMARY_INTERFACE_LIST,(name) => {
    const list = ni_list[name];
    if (list && list.length > 0 && !list[0].internal) {
      value = filter(list[0]);
    }
    return value;
  });

  if (!value) {
    _.any(ni_list,(list,name) => {
      _.any(list,(address) => {
        if (!address.internal) {
          value = filter(address);
        }
        return value;
      });
      return value;
    });
  }
  return value;
}

function send(url,done) {
  if (!done) {
    done = function() {};
  }

  const ni_list = os.networkInterfaces();

  const mac_address = get_first_property(ni_list,(i) => i.mac);
  const ipv4_address = get_first_property(ni_list,(i) => {
    if (i.family == 'IPv4') {
      return i.address;
    }
  });
  const ipv6_address = get_first_property(ni_list,(i) => {
    if (i.family == 'IPv6') {
      return i.address;
    }
  });

  const address_list = [];
  _.each(ni_list,(list,name) => {
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
  const cpu_model = cpus && cpus.length > 0 && cpus[0].model ? cpus[0].model : "";

  const data = {
    mac_address,
    ipv4_address,
    ipv6_address,
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    release: os.release(),
    cpu_model,
    uptime: os.uptime(),
    loadavg: os.loadavg(),
    address_list,
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
