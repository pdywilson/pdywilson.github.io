// JavaScript! I love it!
function update(day, value) {
    localStorage.setItem(day, value);
    document.getElementById(day).style.backgroundColor = getColor(value);
}

function get(day) {
    let dayItem = localStorage.getItem(day);
    return dayItem === "true";
}

function getColor(value) {
    return value ? '#00CC00' : '#FFFFFF';
}

function flip(day) {
    let value = !get(day);
    update(day, value);
}

function getDays() {
    return document.querySelectorAll('h2');
}

function init() {
    let h2Elements = getDays();

    for (let i = 0; i < h2Elements.length; i++) {
        let day = h2Elements[i].id;
        let value = get(day)
        update(day, value)
    }
}

init()
