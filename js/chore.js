// JavaScript! I love it!
function update(day, value) {
    localStorage.setItem(day, value);
    document.getElementById(day).style.backgroundColor = getColor(value);
}

function get(day) {
    let value = localStorage.getItem(day);
    return value === "true";
}

function getColor(value) {
    return value ? '#00CC00' : '#FFFFFF';
}

function flip(day) {
    let value = !get(day);
    update(day, value);
}

function init() {
    ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach((day) => {
        let value = get(day);
        if (value) {
            update(day, value);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    init();

    // fix mobile screen
    const setHeight = () => {
        document.getElementById("container").style.minHeight = window.innerHeight + "px"
    };
    let deviceWidth = window.matchMedia("(max-width: 1024px)");
    if (deviceWidth.matches) {
        window.addEventListener("resize", setHeight);
        setHeight();
    }
});

