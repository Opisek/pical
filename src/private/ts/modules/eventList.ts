import moment, { Moment } from "moment-timezone";

export default class classList {
    private list: any;
    private byDate: any;

    public constructor(height: number, width: number) {
        this.list = {};
        this.byDate = {};
    }

    public addEvent(object: any) {
        object.VEVENT.parsed = {};
        object.VEVENT.parsed.start = getDate(object.VEVENT.DTSTART);
        object.VEVENT.parsed.end = getDate(object.VEVENT.DTEND);
        this.list[object.VEVENT.UID] = object;
        this.insertIntoDate(object.VEVENT.UID, object.VEVENT.parsed.start);
        this.insertIntoDate(object.VEVENT.UID, object.VEVENT.parsed.end);
    }
    private insertIntoDate(id: any, time: Moment) {
        if (!(time.year() in this.byDate)) this.byDate[time.year()] = {};
        let yearCollection = this.byDate[time.year()];
        if (!(time.month() in yearCollection)) yearCollection[time.month()] = {};
        // the same could be done for weeks and months, but i doubt you'd have enough events in such a short timespan for it to be worth it
        yearCollection[time.month()][id] = true; // easy deletion and merge possible
    }
    public getEventsYear(year: number) {

    }
    public getEventsMonth(year: number, month: number) {
        let result: any[] = [];
        if (!(year in this.byDate)) return result;
        let yearCollection = this.byDate[year];
        if (!(month in yearCollection)) return result;
        for (let id of Object.keys(yearCollection[month])) result.push(this.list[id]);
        return { "events": result, "order": this.order(result) };
    }
    private order(events: any[]) {
        let result: any = {};
        events.sort((a, b) => (a.VEVENT.parsed.start.unix() > b.VEVENT.parsed.start.unix()) ? 1 : -1);
        let occupied = [];
        for (let event of events) {
            let start = event.VEVENT.parsed.start.unix();
            let end = event.VEVENT.parsed.end.unix();
            while (occupied.length != 0 && occupied[occupied.length - 1] <= start) occupied.pop();
            occupied.push(0);
            let y = 0;
            while (occupied[y] > start) ++y;
            occupied[y] = end;
            result[event.VEVENT.UID] = y;
        }
        return result;
    }
}

function getDate(value: any): Moment {
	let timezone = "UTC";
	if (Array.isArray(value) && value[1].startsWith("TZID")) timezone = value[1].substr(5);
	return moment.tz(Array.isArray(value) ? value[0] : value, timezone);
}