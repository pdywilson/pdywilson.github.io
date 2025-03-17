document.addEventListener("DOMContentLoaded", function () {
    const yearBornInput = document.getElementById("year-born");
    const priceNowInput = document.getElementById("price-now");
    const adjustedPriceInput = document.getElementById("adjusted-price");
    const calculateButton = document.getElementById("calculate-button");
    const calculate2Button = document.getElementById("calculate-2-button");

    calculateButton.addEventListener("click", function () {
        const yearBorn = parseInt(yearBornInput.value);
        const priceNow = parseFloat(priceNowInput.value);
        const currentYear = new Date().getFullYear();

        if (isNaN(yearBorn) || isNaN(priceNow) || yearBorn >= currentYear) {
            alert("Please enter a valid year and price.");
            return;
        }

        getInflation(yearBorn, currentYear, priceNow)
            .then(adjustedPrice => {
                const [originalAmount, adjustedAmount] = adjustedPrice;
                adjustedPriceInput.value = originalAmount.toFixed(2);
            });
    });

    calculate2Button.addEventListener("click", function () {
        const yearBorn = parseInt(yearBornInput.value);
        const priceAdjusted = parseFloat(adjustedPriceInput.value);
        const currentYear = new Date().getFullYear();

        if (isNaN(yearBorn) || isNaN(priceAdjusted) || yearBorn >= currentYear) {
            alert("Please enter a valid year and price.");
            return;
        }

        getInflation(yearBorn, currentYear, priceAdjusted)
            .then(adjustedPrice => {
                const [originalAmount, adjustedAmount] = adjustedPrice;
                priceNowInput.value = adjustedAmount.toFixed(2);
            });
    });

    async function getInflation(startYear, endYear, amount) {
        const inflationRate = 0.025;
        const years = endYear - startYear;
        const originalAmount = amount / Math.pow(1 + inflationRate, years);
        const adjustedAmount = amount * Math.pow(1 + inflationRate, years);

        return [originalAmount, adjustedAmount];
    }
});