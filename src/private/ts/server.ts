import tsdav, { DAVCalendar, DAVClient, DAVObject } from "tsdav";
import fs from "fs";
import path from "path";
require("dotenv").config();

import eventList from "./modules/eventList";
import webServer from "./modules/webserver";
import { webdavToJson } from "./modules/webdav";

// paths
const privatePath: string = path.resolve(__dirname, "..");
const publicPath: string = path.join(privatePath, "..", "public");
const rootPath: string = path.resolve(privatePath, "..", "..");
const configPath: string = path.join(rootPath, "config");

// caldav
const accounts: any[] = JSON.parse(fs.readFileSync(path.join(configPath, "accounts.json"), "utf8")).accounts;
const eventListObject = new eventList(0, 0);

(async () => {
	// log in with every account
	for (const account of accounts) {
		// authenticate
		const client = await tsdav.createDAVClient({
			serverUrl: account.url,
			credentials: {
				username: account.user,
				password: account.password
			},
			authMethod: "Basic",
			defaultAccountType: "caldav"
		});
		
		// get and parse all calendars
		const calendars: DAVCalendar[] = await client.fetchCalendars();
		for (const calendar of calendars) {
			const objects: DAVObject[] = await client.fetchCalendarObjects({calendar: calendar});
			const parsedObjects: any[] = objects.map(
				(object: DAVObject) => webdavToJson(
					object.data.split("\n").map(
						(e: string) => e.replace("\r", "").split(":")
					),
					1
				)[0]
			);
			
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

// webserver
const webServerInstance: webServer = new webServer(Number.parseInt(process.env.PORT!), publicPath);

webServerInstance.listen("requestEventsMonth", {run: (data: any) => {
	return eventListObject.getEventsMonth(data.year, data.month);
}});
