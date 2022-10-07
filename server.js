const tsdav = require("tsdav");
//require("dotenv").config();

const fs = require("fs");

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
			for (let object of parsedObjects) {
				console.log("-----");
				console.log("\x1b[34m%s\x1b[0m", "Event");
				console.log(object.VEVENT.SUMMARY);
				console.log("\x1b[34m%s\x1b[0m", "Everything");
				console.log(JSON.stringify(object, null, 2));
				console.log("-----");
			};
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
			object[split[index][0]] = split[index][1];
		}
	}
	while (split[++index][0] != "END");
	return [ object, index ];
}
