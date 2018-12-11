var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');
var shortUrl = require('./models/shortUrl');

app.use(bodyParser.json());
app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/shortUrl', { useNewUrlParser: true });

app.get('/', function(req, res){
    res.sendFile(process.cwd() + '/views/index.html');
  });

app.get('/new/:urlToShorten', (req, res) =>{
    var { urlToShorten } = req.params;
    var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    var regex = expression;

    if(regex.test(urlToShorten) === true){
        var short = Math.floor(Math.random()*10000).toString();
        
var data = new shortUrl(
    {   
        originalUrl: urlToShorten,
        shorterUrl: short
    }
);

data.save(err =>{
    if(err){
        return res.send("Error! Save again.");
    }
});
        return res.json(data) 
    }

    var data = new shortUrl(
        {
            originalUrl: 'urlToShort invalid format',
            shorterUrl: 'InvalidURL'
        }
    );
    return res.json(data); 
    
}); 

app.get('/:urlToForward', (req, res) =>{ 
    var shorterUrl =  req.params.urlToForward;

    shortUrl.findOne({'shorterUrl': shorterUrl}, (err, data) =>{
        if(err) return res.send('Error reading database!');
        var re = new RegExp("^(http|https)://", "i");
        var strToCheck = data.originalUrl; 
        if(re.test(strToCheck)){
            res.redirect(301, data.originalUrl); 
        }
        else{
            res.redirect(301, 'http://' + data.originalUrl);
        }
    });
    
});

app.listen(3000, () =>{
    console.log('Server working');
});