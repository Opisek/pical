//import { Manager, Socket } from "socket.io-client"

function requestData(socket: /*Socket*/ any): any {
    return new Promise(resolve => {
        socket.emit("requestEventsMonth", {"year": todayYear, "month": todayMonth}, (response: any) => resolve(response));
    });
}

function getGridPosition(day: number, offset: number) {
    let cell = day + offset - 1;
    console.log(cell);
    return { "x": cell % 7 , "y": Math.floor(cell / 7) };
    // TODO: Check out Date.getDay() for automated calculation of the day of the week (x coordinate)
}

function insertEvent() {

}

async function renderMonth(socket: /*Socket*/ any) {
    let eventList = await requestData(socket);
    var viewCount = new Date(viewYear, viewMonth + 1, 0).getDate();
    var viewOffset = new Date(viewYear, viewMonth, 1).getDay() - 1;
    if (viewOffset == -1) viewOffset = 6;
    if (viewOffset != 0) {
        const main = document.getElementsByTagName("main")[0];
        for (const grid of main.children) {
            grid.innerHTML = "";
            let empty = document.createElement("div");
            empty.classList.add("offset");
            empty.setAttribute("style", `--offset:${viewOffset+1}`);
            grid.appendChild(empty);
        }
    }
    const days = document.getElementById("days");
    if (days == null) return;

    for (let i = 1; i <= viewCount; ++i) {
        let day = document.createElement("div");
        day.innerHTML = i.toString();
        if ((i + viewOffset - 1) % 7 == 0 || i == 1) day.classList.add("start");
        else if ((i + viewOffset) % 7 == 0 || i == viewCount) day.classList.add("end");
        days.appendChild(day);
    
    }
    const eventsGrid = document.getElementById("events");
    if (eventsGrid == null) return;
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

//const socket: Socket = (new Manager()).socket('/');
//window.addEventListener("load", () => renderMonth(socket));

declare const io: () => void;
const socket = io();
window.addEventListener("load", () => renderMonth(socket));