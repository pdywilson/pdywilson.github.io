document.addEventListener('DOMContentLoaded', async () => {
    const checkinTime = document.getElementById('checkin-time');
    const checkinButton = document.getElementById('checkin-button');
    const checkoutTime = document.getElementById('checkout-time');
    const checkoutButton = document.getElementById('checkout-button');

    checkinButton.addEventListener('click', async () => {
        const inTime = checkinTime.value;
        localStorage.setItem('checkin_time', inTime);
        checkoutTime.value = calculateCheckoutTime(inTime, 492);
    });

    checkoutButton.addEventListener('click', async () => {
        const outTime = checkoutTime.value;
        localStorage.setItem('checkout_time', outTime);
        checkinTime.value = calculateCheckoutTime(outTime, -492);
    });

    function calculateCheckoutTime(time, minutes) {
        const date = new Date();
        date.setHours(time.substr(0,2));
        date.setMinutes(time.substr(3,5));
        return format(new Date(date.getTime() + minutes*60000));
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

    Date.prototype.addHours = function(h) {
        this.setTime(this.getTime() + (h*60*60*1000));
        return this;
      }
});