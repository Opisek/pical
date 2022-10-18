const moment = require("moment-timezone");

class classList {
    constructor(height, width) {
      this._list = {};
      this._byDate = {};
    }
    addEvent(object) {
        object.VEVENT.parsed = {};
        object.VEVENT.parsed.start = getDate(object.VEVENT.DTSTART);
        object.VEVENT.parsed.end = getDate(object.VEVENT.DTEND);
        this._list[object.VEVENT.UID] = object;
        this._insertIntoDate(object.VEVENT.UID, object.VEVENT.parsed.start);
        this._insertIntoDate(object.VEVENT.UID, object.VEVENT.parsed.end);
    }
    _insertIntoDate(id, time) {
        if (!(time.year() in this._byDate)) this._byDate[time.year()] = {};
        let yearCollection = this._byDate[time.year()];
        if (!(time.month() in yearCollection)) yearCollection[time.month()] = {};
        // the same could be done for weeks and months, but i doubt you'd have enough events in such a short timespan for it to be worth it
        yearCollection[time.month()][id] = true; // easy deletion and merge possible
    }
    getEventsYear(year) {

    }
    getEventsMonth(year, month) {
        let result = [];
        if (!(year in this._byDate)) return result;
        let yearCollection = this._byDate[year];
        if (!(month in yearCollection)) return result;
        for (let id of Object.keys(yearCollection[month])) result.push(this._list[id]);
        return { "events": result, "order": this._order(result) };
    }
    _order(events) {
        let result = {};
        events = events.sort((a, b) => (a.VEVENT.parsed.start.unix() > b.VEVENT.parsed.start.unix()) ? 1 : -1);
        let occupied = [];
        for (let event of events) {
            let start = event.VEVENT.parsed.start.unix();
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

function getDate(value) {
	let timezone = "UTC";
	if (Array.isArray(value) && value[1].startsWith("TZID")) timezone = value[1].substr(5);
	return moment.tz(Array.isArray(value) ? value[0] : value, timezone);
}

module.exports = classList;