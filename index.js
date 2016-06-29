var TeamSpeak = require('node-teamspeak-api');
var _ = require('lodash');
var push = require('pushover-notifications');

// Channel to monitor
var CHANNEL_NAME = process.env.CHANNEL_NAME;

// Do not send notifications if this client is present
var CLIENT_NAME = process.env.CLIENT_NAME;

// Minimum number of clients needed in channel for low priority alert
var MIN_CLIENTS = process.env.MIN_CLIENTS || 3;

// Minimum number of clients needed in channel for high priority alert
var MIN_CLIENTS_HIGH_PRIORITY = process.env.MIN_CLIENTS_HIGH_PRIORITY || 5;

// Pushover token for user to notify
var PUSHOVER_USER = process.env.PUSHOVER_USER;

// Pushover app api key
var PUSHOVER_APP = process.env.PUSHOVER_APP;

// TeamSpeak server address to monitor
var TS_SERVER = process.env.TS_SERVER;

// Post of virtual server on TeamSpeak server
var TS_PORT = process.env.TS_PORT;

// Port used for ServerQuery connections
var TS_QUERY_PORT = process.env.TS_QUERY_PORT || 10011;

// Username for ServerQuery user
var TS_LOGIN = process.env.TS_LOGIN;

// Password for ServerQuery user
var TS_PASS = process.env.TS_PASS;


var tsClient = new TeamSpeak(TS_SERVER, TS_QUERY_PORT);
var clientList = [];
var channels = [];

var notifyChannelCount = function(count) {
  if (count >= MIN_CLIENTS) {
    tsClient.api.clientlist(function(err, resp, req) {
      var dev = _.find(resp.data, function(c) { return c.client_nickname == CLIENT_NAME; });
      if(_.isUndefined(dev)) {
        sendNotification(count);
      }
    });
  }
};

var sendNotification = function(count) {
  var p = new push( {
    user: PUSHOVER_USER,
    token: PUSHOVER_APP
  });

  var priorityLvl = count >= MIN_CLIENTS_HIGH_PRIORITY ? 1 : 0;

  var msg = {
    title: 'The team is ready',   // required
    message: 'There are currently ' + count + ' people in the Overwatch channel.',
    priority: priorityLvl
  };

  p.send(msg, function(err, result) {
    if (err) { throw err;
    } console.log(result);
  });
}

var countChannelPlayers = function() {
  tsClient.api.channellist(function(err, resp, req) {
    var overwatchChannel = _.find(resp.data, function(ch) {
      return ch.channel_name == CHANNEL_NAME;
    });
    var overwatchCount = overwatchChannel.total_clients;
    notifyChannelCount(overwatchCount);
  });
};

var registerEvents = function() {
  tsClient.on('notify.cliententerview', function(eventName, client) {
    clientList.push(client);
    tsClient.api.channellist();
  });

  tsClient.on('notify.clientleftview', function(eventName, client) {
    _.remove(clientList, function(c) { return c.clid == client.clid; });
  });

  tsClient.on('notify.clientmoved', function(eventName, resp) {
    countChannelPlayers();
  });
}

var login = function() {
  tsClient.api.login({
      client_login_name: TS_LOGIN,
      client_login_password: TS_PASS
  }, function(err, resp, req) {
      tsClient.api.use({
          port: TS_PORT
      }, function(err, resp, req) {
          tsClient.subscribe({
            event: 'server'
          });
          tsClient.api.channellist(function(err, resp, req) {
            channel = _.find(resp.data, function(ch) {
              return ch.channel_name == CHANNEL_NAME;
            });
            tsClient.subscribe({
              event: 'channel',
              id: channel.cid
            });
          });
      });
  });
};

var init = function() {
  if (_.isUndefined(PUSHOVER_USER) || _.isUndefined(PUSHOVER_APP)) {
    console.log('PUSHOVER_USER and PUSHOVER_APP environment variables must be present.');
    process.exit(1);
  } else if (MIN_CLIENTS > MIN_CLIENTS_HIGH_PRIORITY) {
    console.log('MIN_CLIENTS must be less than MIN_CLIENTS_HIGH_PRIORITY.');
    process.exit(1);
  } else if (_.isUndefined(TS_SERVER) || _.isUndefined(TS_PORT)) {
    console.log('TS_SERVER and TS_PORT environment variables must be present.');
    process.exit(1);
  } else if (_.isUndefined(CHANNEL_NAME)) {
    console.log('CHANNEL_NAME environment variable must be present.');
    process.exit(1);
  } else if (_.isUndefined(CLIENT_NAME)) {
    console.log('CLIENT_NAME environment variable must be present.');
    process.exit(1);
  } else if (_.isUndefined(TS_LOGIN) || _.isUndefined(TS_PASS)) {
    console.log('TS_LOGIN and TS_PASS environment variables must be present.');
    process.exit(1);
  } else {
    login();
    registerEvents();
  }
};

init();
