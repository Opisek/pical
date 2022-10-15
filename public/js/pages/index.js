function renderMonth() {
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
    const events = document.getElementById("events");
    for (let i = 1; i <= 5; ++i) {
        let event = document.createElement("div");
        event.innerHTML = `Event ${i}`;
        events.appendChild(event);
    }
}
const today = new Date();
const todayDay = today.getUTCDate();
const todayMonth = today.getUTCMonth();
const todayYear = today.getUTCFullYear();
var viewDay = todayDay;
var viewMonth = todayMonth;
var viewYear = todayYear;
window.addEventListener("load", () => renderMonth());