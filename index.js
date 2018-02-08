var https = require('https');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var coin = {
    id: 2,
    name: 'usdt'
};
var otcurl = 'https://otcbtc.com/sell_offers?currency=' + coin.name + '&fiat_currency=cny&payment_type=all';
var huobiurl = 'https://api-otc.huobi.pro/v1/otc/trade/list/public?coinId=' + coin.id + '&tradeType=1&currentPage=1&payWay=&country=&merchant=0&online=1&range=0';
var okexurl = 'https://www.okex.com/v2/c2c-open/tradingOrders/group?digitalCurrencySymbol=usdt&legalCurrencySymbol=cny';
// 'https://www.okex.com/c2c/trade/openTrade.do#usdt';

function startRequest() {
    //采用http模块向服务器发起一次get请求
    console.log(coin.name + '价格');
    var currentPrice = 0;
    https.get(otcurl, function (res) {
        var html = '';        //用来存储请求网页的整个html内容
        res.setEncoding('utf-8'); //防止中文乱码
        // 监听data事件，每次取一块数据
        res.on('data', function (chunk) {
            html += chunk;
        });
        //监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
        res.on('end', function () {

            var $ = cheerio.load(html); //采用cheerio模块解析html

            currentPrice = $('.box .price').text().replace('CNY', '').trim();

            var lastestPrice = $('.long-solution-list .list-content').first().find('.price').contents().filter(function (index, content) {
                return content.nodeType === 3;
            }).text().trim();
            console.log(coin.name + '现价', currentPrice);
            console.log('otc底价', lastestPrice, '溢价', (lastestPrice/currentPrice - 1) * 100 + '%');

            https.get(huobiurl, function (res) {
                var html = '';        //用来存储请求网页的整个html内容
                res.setEncoding('utf-8'); //防止中文乱码
                // 监听data事件，每次取一块数据
                res.on('data', function (chunk) {
                    html += chunk;
                });
                //监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
                res.on('end', function () {
                    var obj = JSON.parse(html)
                    console.log('火币底价', obj.data[0].price, '溢价', (obj.data[0].price/currentPrice - 1) * 100 + '%');
                });
            });
            var option = {
                hostname: 'www.okex.com',
                path: '/v2/c2c-open/tradingOrders/group?digitalCurrencySymbol=usdt&legalCurrencySymbol=cny',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8'
                }
            };
            // https.request(option, function (res) {
                // var html = '';        //用来存储请求网页的整个html内容
                // res.setEncoding('utf-8'); //防止中文乱码
                // // 监听data事件，每次取一块数据
                // console.log(res);
                // res.on('data', function (chunk) {
                //     html += chunk;
                //     console.log(chunk);
                // });
                // //监听end事件，如果整个网页内容的html都获取完毕，就执行回调函数
                // res.on('end', function () {

                //     var $ = cheerio.load(html); //采用cheerio模块解析html

                //     // var lastestPrice = $('.buytable .table .tables-item').first().find('.totals>.fontweight>span').text();
                //     // var obj = JSON.parse(html)
                //     // console.log('okex底价', html);
                // });
            // });
            // request({
            //     url: okexurl,
            //     method: "GET",
            //     headers: {
            //         "content-type": "application/json",
            //     },
            //     // body: JSON.stringify({
            //     //     digitalCurrencySymbol: 'usdt',
            //     //     legalCurrencySymbol: 'cny'
            //     // })
            // }, function(error, response, body) {
            //     console.log(body);
            // });
        });
    });
}
// function savedContent($, news_title) {
//     $('.article-content p').each(function (index, item) {
//         var x = $(this).text();

//         var y = x.substring(0, 2).trim();

//         if (y == '') {
//             x = x + '\n';
//             //将新闻文本内容一段一段添加到/data文件夹下，并用新闻的标题来命名文件
//             fs.appendFile('./data/' + news_title + '.txt', x, 'utf-8', function (err) {
//                 if (err) {
//                     console.log(err);
//                 }
//             });
//         }
//     })
// }
startRequest();
// setInterval(startRequest, 3000);