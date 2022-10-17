module.exports = {
    order: order
}

function order(elements) {
    result = {};
    elements.sort((a, b) => (a.start > b.start) ? 1 : -1);
    occupied = [];
    for (let element of elements) {
        while (occupied.length != 0 && occupied[occupied.length - 1] <= element.start) occupied.pop();
        occupied.push(0);
        let y = 0;
        while (occupied[y] > element.start) ++y;
        occupied[y] = element.end;
        result[element.id] = y;
    }
    return result;
}