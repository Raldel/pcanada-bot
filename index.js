var ProxyFinder = require('public-proxy-finder');
var proxyChecker = require('proxy-checker');
var asyncLoop = require('node-async-loop');

//scrape and check proxies
async function scrapeAndCheck(cb) {
  console.log("Harvesting fresh proxies...");
  ProxyFinder.all() //Retrieve an up-to-date list of SSL proxies
    .filter(function (proxy) { 
      return objectHasAllProps(proxy, ['IP Address', 'Port', 'Last Checked', 'Https'])
              //&& (proxy['Last Checked'] < 60 * 15 * 1000) // Filter out any proxies that haven't been checked for over 30 minutes
              && (proxy['Https'] == true);
    })
    .then(async function (proxyList) {
      console.log('HTTPS ANON Proxies Scraped: ' + proxyList.length);
      var newList = [];
      var i = 0;
      asyncLoop(proxyList, function (item, next) {
        proxyChecker.checkProxy(
          // The path to the file containing proxies
          item['IP Address'],
          item['Port'],
          {
            // the complete URL to check the proxy
            url: checkProxyURL,
            // an optional regex to check for the presence of some text on the page
            regex: confirmWord,
            https: false,//item.Https,
            timeout: 120*1000,
          },
          // Callback function to be called after the check
          function (host, port, ok, statusCode, err) {
            console.log('('+(++i)+') ' + host + ':' + port + ' => '
              + ok + ' (status: ' + statusCode + ', err: ' + err + ')');
            if (!err) {
              if (statusCode == 200) {
                newList.push(host + ":" + port);
              }
            }
            next();
          }
        );
      }, function () {
        console.log(newList);
        console.log("Working Proxies:" + newList.length);
        return cb(newList);
      });
    });
}
