document.addEventListener('DOMContentLoaded', async () => {
    const checkinTime = document.getElementById('checkin-time');
    const checkinButton = document.getElementById('checkin-button');
    const checkoutTime = document.getElementById('checkout-time');
    const checkoutButton = document.getElementById('checkout-button');
    const pauseTime = document.getElementById('pause-time');
    const pauseEndTime = document.getElementById('pause-end-time');
    const workTime = 8 * 60 + 18;

    checkinButton.addEventListener('click', async () => {
        updateCheckin();
    });

    checkinTime.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter')
            updateCheckin();
    });

    function updateCheckin() {
        const inTime = checkinTime.value;
        localStorage.setItem('checkin_time', inTime);
        checkoutTime.value = updateTime(inTime, workTime);
        pauseTime.value = updateTime(inTime, 6 * 60);
        pauseEndTime.value = updateTime(pauseTime.value, 30);
    };

    checkoutButton.addEventListener('click', async () => {
        const outTime = checkoutTime.value;
        localStorage.setItem('checkout_time', outTime);
        checkinTime.value = updateTime(outTime, -workTime);
    });

    function updateTime(time, minutes) {
        const date = new Date();
        date.setHours(time.substr(0, 2));
        date.setMinutes(time.substr(3, 5));
        return format(new Date(date.getTime() + minutes * 60000));
    };

    function format(date) {
        let h = date.getHours().toString();
        if (h.length == 1) {
            h = '0' + h;
        }
        let m = date.getMinutes().toString();
        if (m.length == 1) {
            m = '0' + m;
        }
        return h + ":" + m;
    }

    Date.prototype.addHours = function (h) {
        this.setTime(this.getTime() + (h * 60 * 60 * 1000));
        return this;
    }
});