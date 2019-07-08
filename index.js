var Crawler = require('crawler');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');



// Connection URL
const url = 'mongodb://139.155.103.174:27017';

// Database Name
const dbName = 'game';

// Use connect method to connect to the server
MongoClient.connect(url, function (err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    crawl(client)
});


function crawl(client) {
    const db = client.db(dbName);
    const collections = db.collection('game')
    const games = []

    var c = new Crawler({
        rateLimit: 100,
        maxConnections: 1,
        callback: function (error, res, done) {
            if (error) {
                console.log(error)
            } else {
                var $ = res.$;
                const game = new Object()
                game.name = $('.c-banner_name').text()
                game.subname = $('.c-banner_sub-names').text()
                game.introduction = $('.c-banner_summary').text()
                game.coverUrl = $('.c-banner_name').parent().parent().parent().find('img').attr('src')
                $('.c-info-table tr').each(function () {
                    //console.log($(this))
                    const tag = $($(this).children('td').get(0)).text()
                    switch (tag) {
                        case '首发日期':
                            game.startDate = $($(this).children('td').get(1)).text()
                            break
                        case '开发商':
                            game.issuer = $($(this).children('td').get(1)).text()
                            break
                        case '游戏引擎':
                            game.engine = $($(this).children('td').get(1)).text()
                            break
                        case '类别':
                            const type = []
                            $($(this).children('td').get(1)).children().each(function () {
                                type.push($(this).text())
                            })
                            game.type = type
                            break
                        case '主题':
                            const theme = []
                            $($(this).children('td').get(1)).children().each(function () {
                                theme.push($(this).text())
                            })
                            game.theme = theme
                            break
                        case '游戏模式':
                            const mode = []
                            $($(this).children('td').get(1)).children().each(function () {
                                mode.push($(this).text())
                            })
                            game.mode = mode
                            break
                        case '玩家视角':
                            const view = []
                            $($(this).children('td').get(1)).children().each(function () {
                                view.push($(this).text())
                            })
                            game.view = view
                            break
                    }
                })
                game.description = $('.vd-card p').text()
                game.imgUrl = []
                $('ul').find('img').each(function () {
                    game.imgUrl.push($(this).attr('src'))
                })
                console.log(game.name)
                games.push(game)
                collections.insert(game)
            }
            done();
        }
    })


    for (let i = 15001; i < 20000; i++) {
        c.queue(`https://game.tgbus.com/game/${i}`)
    }

    //client.close();
}