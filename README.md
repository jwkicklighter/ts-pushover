# TS Pushover
Sends TeamSpeak events to Pushover

## Usage
The initial usage of this project is to enable monitoring of a TeamSpeak channel and send alerts to a pushover user when a certain number of clients have connected to that channel.

### Variables

Required:
- `PUSHOVER_USER`: user token to send pushover notifications
- `PUSHOVER_APP`: app api key from pushover (make a new application from your control panel)
- `TS_SERVER`: server address of the TeamSpeak server to monitor
- `TS_PORT`: port of the virtual server at the TeamSpeak address
- `CHANNEL_NAME`: name of the channel to monitor
- `CLIENT_NAME`: your client nickname, so alerts are not sent if you are connected
- `TS_LOGIN`: username for serverquery
- `TS_PASS`: password for serverquery

Optional:
- `MIN_CLIENTS`: the minimum number of clients that must be present in the channel for alerts to be sent
- `MIN_CLIENTS_HIGH_PRIORITY`: minimum number of clients for a high priority notification
- `TS_QUERY_PORT`: port used for ServerQuery to connect, this is usually just the default

### Example usage
```
$ npm install
$ PUSHOVER_USER='xxxxxxxxxxxxx' PUSHOVER_APP='xxxxxxxxxxx' TS_SERVER='localhost' TS_PORT='10000' CLIENT_NAME='jwkicklighter' CHANNEL_NAME='my cool CHANNEL!' TS_LOGIN='myquerydude' TS_PASS='somesecretsauce' node index.js
```
