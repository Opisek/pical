const dav = require("dav");
//require("dotenv").config();

const fs = require("fs");

let accounts = JSON.parse(fs.readFileSync("accounts.json")).accounts;

for (let account of accounts) {
	console.log(JSON.stringify(account, null, 2));

	let xhr = new dav.transport.Basic(
		new dav.Credentials({
			username: account.user,
			password: account.password
		})
	);

	let client = new dav.Client(xhr);
	
	client.createAccount({
		server: account.url,
		accountType: "caldav"
	}).then(function(acc) {
		acc.calendars.forEach(cal => {
			console.log(cal.displayName);
		});
	}).catch(e => { console.error(e); });
}
