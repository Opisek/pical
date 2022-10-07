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
			objects.forEach(object => {
				console.log(JSON.stringify(webdavToJson(object), null, 2));
			});
		}
	}
})();

function webdavToJson(webdavObject) {
	let split = webdavObject.data.split("\n");
	let splitObject = {};
	split.forEach(entry => {
		let tuple = entry.split(":");
		splitObject[tuple[0]] = tuple[1].replace("\r","");
	});
	return {
		etag: webdavObject.etag,
		url: webdavObject.url,
		data: splitObject
	}
}
