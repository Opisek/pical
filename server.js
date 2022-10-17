const moment = require("moment-timezone");
const tsdav = require("tsdav");
const fs = require("fs");
const path = require("path");
const http = require("http");
require("dotenv").config();

const { order } = require("./modules/packing.js");


// caldav stuff

let accounts = JSON.parse(fs.readFileSync("accounts.json")).accounts;

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
			let elements = [];
			for (let index in parsedObjects) {
				let object = parsedObjects[index];
				elements.push(
					{
						"id": elements.length,
						"start": getDate(object.VEVENT.DTSTART).unix(),
						"end": getDate(object.VEVENT.DTEND).unix()
					}
				);
				/*console.log("-----");
				console.log("\x1b[34m%s\x1b[0m", "Event");
				console.log(object.VEVENT.SUMMARY);
				console.log("\x1b[34m%s\x1b[0m", "Start");
				console.log(getDate(object.VEVENT.DTSTART).format("Do MMMM Y HH:mm:ss"));
				console.log("\x1b[34m%s\x1b[0m", "End");
				console.log(getDate(object.VEVENT.DTEND).format("Do MMMM Y HH:mm:ss"));
				//console.log("\x1b[34m%s\x1b[0m", "Everything");
				//console.log(JSON.stringify(object, null, 2));
				console.log("-----");*/
			};
			let ordering = order(elements);
			console.log(ordering);
			for (let index in parsedObjects) {
				let object = parsedObjects[index];
				console.log(object.VEVENT.SUMMARY);
				console.log(getDate(object.VEVENT.DTSTART).format("Do MMMM Y HH:mm:ss"));
				console.log(getDate(object.VEVENT.DTEND).format("Do MMMM Y HH:mm:ss"));
				console.log(ordering[index]);
			}
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

function getDate(value) {
	let timezone = "UTC";
	if (Array.isArray(value) && value[1].startsWith("TZID")) timezone = value[1].substr(5);
	return moment.tz(Array.isArray(value) ? value[0] : value, timezone);
}

// web stuff

const express = require("express");
const server = express();
server.use(express.json());
server.use(express.urlencoded({extended:false}));
server.set("view engine", "ejs");

const serverPath = __dirname;
const publicPath = path.join(serverPath + '/public');
server.set("views", path.join(publicPath + '/ejs'))
server.set("/partials", path.join(publicPath + '/partials'))
server.use("/css", express.static(path.join(publicPath + '/css')));
server.use("/js", express.static(path.join(publicPath + '/js')));
server.use("/images", express.static(path.join(publicPath + '/images')));

server.set("trust proxy", "loopback, linklocal, uniquelocal")

server.get("/", (req, res) => {
    //if (authenticate(req, res)) return;

    //res.render(`index`, {host: `https://${host}`});
    res.render("index");
    res.end();
});

server.get("*", (req, res) => {
    res.status(404);
    res.render("404", { host: `${req.protocol}://${req.hostname}/` });
    res.end();
});

const httpServer = http.createServer(server);
httpServer.listen(process.env.PORT);
console.log("listening on " + process.env.PORT);