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

		console.log(calendars);
	}
})();
