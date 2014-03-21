var express = require('express')
var app = express()
var mongoClient = require('mongodb').MongoClient
var mongoUri = process.env.MONGOHQ_URL || "mongodb://localhost:27017/beerchallenge"

var mockData = {
  list: [
    { name: 'yue', time: '1.1' },
    { name: 'rgd', time: '1.2' },
    { name: 'lop', time: '2.0' },
    { name: 'xxx', time: '2.2' },
    { name: 'lui', time: '3.1' },
    { name: 'wer', time: '7.3' },
    { name: 'bvn', time: '12.1' },
    { name: 'iuo', time: '111.1' },
    { name: 'iop', time: '123.0' },
    { name: 'rte', time: '221.8' },
  ],
  type: '24h'
}

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

var initDb = function(cb){
  console.log("init db")
  mongoClient.connect(mongoUri, function(err, db){
    console.log("db connected")
    cb(db)
  })
}

var initRoutes = function(db){
  console.log("init routes")

  app.get('/', function(req, res) {
    res.render('index.html')
  })

  app.get('/nexus', function(req, res) {
    var file = __dirname + '/BeerChallenge.apk'
    res.download(file)
  })

  var getHighscores = function(type, cb){
    db.collection('highscore').find({}).toArray(function(err, data){
      if(err){
        console.error("Unable to get highscores:", JSON.stringify(err))
        cb(null)
      }
      else{
        console.log("highscore data: ", data)
        cb(data)
      }
    })
  }

  app.get('/highscores', function(req, res) {
    var cb = function(data){
      if(!data){
        res.send(400)
      }
      else{
        res.send(data)
      }
    }

    getHighscores("24h", cb)
  })

  app.post('/highscores', function(req, res) {
    console.log('Highscores', req.body)

    var data = {
      name: req.body.user,
      time: req.body.score,
      createdAt: new Date()
    }

    if(!data.time){
      res.send(400)
    }

    var respond = function(data){
      console.log("highscore respond", data)
      if(data){
        res.send({
          list: data,
          type: "24h"
        })
      }
      else{
        res.send(500)
      }
    }

    db.collection('highscore').insert(data, function(err, data){
      if(err){
        console.error("Unable to save to database:", JSON.stringify(err))
        res.send(500)
      }
      else{
        console.log("highscore saved to database: ",  data)
        getHighscores("24h", respond)
      }
    })
  })

  app.post('/noBeer', function(req, res) {
    console.log('No beer', req.body)
    res.end()
  })

  app.post('/contact', function(req, res) {
    mongo.Db.connect(mongoUri, function(err, db) {
      if (err)
        res.send(530)
      else
        db.collection('contact', function(errr, collection) {
          if (errr)
            res.send(531)
          else
            collection.insert({email: req.body['email']}, {safe: true}, function(errrr, rs) {
              if (errrr)
                res.send(532)
              else
                res.send(204)
            })
        })
    })
  })
}

var init = function(){
  var cb = function(db){
    initRoutes(db)
  }

  initDb(cb)

  var port = process.env.PORT || 5000

  app.use(express.logger())
  app.use(express.bodyParser())
  app.use(allowCrossDomain);
  app.set('views', __dirname + '/')
  app.engine('html', require('ejs').renderFile)

  app.listen(port, function() {
    console.log("Listening on " + port)
  })
}.call(this)
