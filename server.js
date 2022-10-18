const moment = require("moment-timezone");
const tsdav = require("tsdav");
const fs = require("fs");
const path = require("path");
const http = require("http");
require("dotenv").config();

const eventList = require("./modules/eventList");


// caldav stuff

let accounts = JSON.parse(fs.readFileSync("accounts.json")).accounts;
let eventListObject = new eventList();

(async () => {
	for (let account of accounts) {
		console.log(JSON.stringify(account, null, 2));

		const client = await tsdav.createDAVClient({
			serverUrl: account.url,
			credentials: {
				username: account.user,
				password: account.password
			},
			authMethod: "Basic",
			defaultAccountType: "caldav"
		});
		
		const calendars = await client.fetchCalendars();

		for (let calendar of calendars) {
			const objects = await client.fetchCalendarObjects({calendar: calendar});
			const parsedObjects = objects.map(object => webdavToJson(object.data.split("\n").map(e => e.replace("\r", "").split(":")), 1)[0]);
			//console.log(JSON.stringify(parsedObjects, null, 2));
			for (let object of parsedObjects) eventListObject.addEvent(object);
			/*let ordering = order(elements);
			console.log(ordering);
			for (let index in parsedObjects) {
				let object = parsedObjects[index];
				console.log(object.VEVENT.SUMMARY);
				console.log(getDate(object.VEVENT.DTSTART).format("Do MMMM Y HH:mm:ss"));
				console.log(getDate(object.VEVENT.DTEND).format("Do MMMM Y HH:mm:ss"));
				console.log(ordering[index]);
			}*/
		}
	}
})();

function webdavToJson(split, index) {
	let object = {};
	do {
		let val;
		if (split[index][0] == "BEGIN") {
			let result = webdavToJson(split, index+1);
			object[split[index][1]] = result[0];
			index = result[1];
		} else {
			let keySplit = split[index][0].split(";");
			if (keySplit.length == 1) object[split[index][0]] = split[index][1];
			else object[keySplit.shift()] = [ split[index][1], keySplit.join(";") ];
		}
	}
	while (split[++index][0] != "END");
	return [ object, index ];
}

// web stuff

const express = require("express");
const webServer = express();
const httpServer = http.createServer(webServer);
const socketio = require("socket.io");
const socketServer = new socketio.Server(httpServer);
webServer.use(express.json());
webServer.use(express.urlencoded({extended:false}));
webServer.set("view engine", "ejs");

const serverPath = __dirname;
const publicPath = path.join(serverPath + '/public');
webServer.set("views", path.join(publicPath + '/ejs'))
webServer.set("/partials", path.join(publicPath + '/partials'))
webServer.use("/css", express.static(path.join(publicPath + '/css')));
webServer.use("/js", express.static(path.join(publicPath + '/js')));
webServer.use("/images", express.static(path.join(publicPath + '/images')));

webServer.set("trust proxy", "loopback, linklocal, uniquelocal")

webServer.get("/", (req, res) => {
    //if (authenticate(req, res)) return;

    //res.render(`index`, {host: `https://${host}`});
    res.render("index");
    res.end();
});

webServer.get("*", (req, res) => {
    res.status(404);
    res.render("404", { host: `${req.protocol}://${req.hostname}/` });
    res.end();
});

socketServer.on("connection", socket => {
	socket.on("requestEventsMonth", (data, callback) => {
		callback(eventListObject.getEventsMonth(data.year, data.month));
	});
});

httpServer.listen(process.env.PORT);
console.log("listening on " + process.env.PORT);