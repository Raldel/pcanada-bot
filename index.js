const request = require('request');
const jsdom = require('jsdom');

const loginPage = 'https://app.petro-canada.ca/en/login.aspx?app';
const host = 'app.petro-canada.ca';
const androidAppId = 'com.petrocanada.my_petro_canada';

// 1st step
// Fetch login page and get some data

function fetchLoginPageToken() {
    return new Promise((resolve, reject) => {
        request({
            method: 'GET',
            url: loginPage,
            headers: {
                "Host": host,
                "Upgrade-Insecure-Requests": "1",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
                "Accept-Language": "en-US",
                "X-Requested-With": androidAppId,
                "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; vivo 1601 Build/MRA58K; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/71.0.3578.99 Mobile Safari/537.36",
            },
        }, function (error, response, body) {
            var dom = new jsdom.JSDOM(body);
            var viewstate = dom.window.document.getElementById('__VIEWSTATE').value;
            var eventvalidation = dom.window.document.getElementById('__EVENTVALIDATION').value;
            resolve({ viewstate, eventvalidation });
        });

    });
}

// 2nd step
// Use that data and post login info

// 3rd step
// If login success, fetch some user data

