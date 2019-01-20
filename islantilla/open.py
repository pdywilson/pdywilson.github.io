import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

driver = webdriver.Firefox()

driver.get('https://www.skylinewebcams.com/webcam/espana/andalucia/huelva/islantilla.html')

driver.execute_script("""
    // Set the style for the webcam element
    var webcam = document.getElementById('webcam');
    webcam.style.position = 'fixed';
    webcam.style.top = '0';
    webcam.style.left = '0';
    webcam.style.width = '100%';
	webcam.style.zIndex = '100';

    // Hide the specified elements
    var selectorsToHide = ['.nav', '.bg-light', '.header', '.footer'];
    selectorsToHide.forEach(function(selector) {
        var elements = document.querySelectorAll(selector);
        for (var i = 0; i < elements.length; i++) {
            elements[i].style.display = 'none';
        }
    });

""")

player_poster = WebDriverWait(driver, 10).until(
    EC.presence_of_element_located((By.CSS_SELECTOR, '.player-poster.clickable'))
)
webdriver.ActionChains(driver).move_to_element(player_poster).click().perform()

input('Enter to quit...')

driver.quit()

