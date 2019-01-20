// JavaScript! I love it!
function update(day, value) {
    if(value >= 0) {
        let text = document.getElementById("pint").innerText.repeat(value);
        document.getElementById(day).innerText = text;
        localStorage.setItem(day, value);
    }
}

function get(day) {
    return localStorage.getItem(day) || 0;
}

function change(day, value){
    update(day, value);
    calc();
}

function increment(day) {
    let value = get(day);
    value++;
    change(day, value);
}

function decrease(day) {
    let value = get(day);
    value--;
    change(day, value);
}

function calc() {
    let days = getDays();
    let total = 0;
    for (let i = 0; i < days.length; i++) {
        total += parseInt(get(days[i].id));    
    }
    let average = total/7;
    update('total', total);
    update('average', average.toFixed());
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
    calc();
}

init()
