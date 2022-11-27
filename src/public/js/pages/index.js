function requestData() {
    return new Promise((resolve, reject) => {
        socket.emit("requestEventsMonth", {"year": todayYear, "month": todayMonth}, response => resolve(response));
    });
}

function getGridPosition(day, offset) {
    let cell = day + offset - 1;
    console.log(cell);
    return { "x": cell % 7 , "y": Math.floor(cell / 7) };
    // TODO: Check out Date.getDay() for automated calculation of the day of the week (x coordinate)
}

function insertEvent() {

}

async function renderMonth() {
    let eventList = await requestData();
    var viewCount = new Date(viewYear, viewMonth + 1, 0).getDate();
    var viewOffset = new Date(viewYear, viewMonth, 1).getDay() - 1;
    if (viewOffset == -1) viewOffset = 6;
    if (viewOffset != 0) {
        const main = document.getElementsByTagName("main")[0];
        for (const grid of main.children) {
            grid.innerHTML = "";
            let empty = document.createElement("div");
            empty.classList.add("offset");
            empty.style = `--offset:${viewOffset+1}`;
            grid.appendChild(empty);
        }
    }
    const days = document.getElementById("days");
    for (let i = 1; i <= viewCount; ++i) {
        let day = document.createElement("div");
        day.innerHTML = i;
        if ((i + viewOffset - 1) % 7 == 0 || i == 1) day.classList.add("start");
        else if ((i + viewOffset) % 7 == 0 || i == viewCount) day.classList.add("end");
        days.appendChild(day);
    }
    const eventsGrid = document.getElementById("events");
    for (const event of eventList.events) {
        let eventElement = document.createElement("div");
        console.log(event.VEVENT.SUMMARY);
        console.log(event.VEVENT.parsed.start);
        console.log(getGridPosition(new Date(event.VEVENT.parsed.start).getUTCDate(), viewOffset));
        //eventsGrid.appendChild(event);
    }
}
const today = new Date();
const todayDay = today.getUTCDate();
const todayMonth = today.getUTCMonth();
const todayYear = today.getUTCFullYear();
var viewDay = todayDay;
var viewMonth = todayMonth;
var viewYear = todayYear;

const socket = io();

window.addEventListener("load", () => renderMonth(socket));