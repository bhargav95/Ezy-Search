var express = require('express');
var app = express();

var geocode_key = 'AIzaSyBn0GiQxOP7NmQNom0hY8YPlmDozSiopSE';

var nearby_key = 'AIzaSyDKBBrurLUSNV-68rOTgWWvc2Bz6t6_kpw';
const request = require('request');
var path    = require("path");
var bodyParser     =     require("body-parser");

'use strict';
const yelp = require('yelp-fusion');

const client = yelp.client('zscQJboA8f4Dd2e3LSxV4AufNZLiiJ0165WW0NyPDO3wafoyRDi2qjZIH0KOG2Kk_rT_82vWCO-eEvUx4ZEB76LoT_B3aF_kxY42dD2uJIO735tXO2MtVrOkf4TAWnYx');

// matchType can be 'lookup' or 'best'

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname,'public')));
// respond with "hello world" when a GET request is made to the homepage
/*app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname+'/first.html'));
})*/

function sleep(milliseconds) {
 var start = new Date().getTime();
 for (var i = 0; i < 1e7; i++) {
   if ((new Date().getTime() - start) > milliseconds){
     break;
   }
 }
}
app.get('/geolocation', function(req,res)
    {
      request.get('http://ip-api.com/json', (error, response, body) => {
        let json = JSON.parse(body);
        //console.log(json);
        res.send(json);
      });

    });


app.get('/yelpReviews', function(req,res)
{
    console.log('Yelp reviews called');
    client.reviews(req.body.id).then(response => {
      //console.log(response.jsonBody.reviews[0].text);
      console.log(response.jsonBody.reviews);
      res.send(response.jsonBody.reviews);

    }).catch(e => {
      console.log(e);
      res.send({});
    });
});

app.get('/yelpSearch', function(req,res)
{
    var headers= {}
    var options={};
    console.log('Yelp search called');
    options.url = 'https://api.yelp.com/v3/businesses/matches/best';
    options.method= 'GET';
    console.log(req.query);
    client.businessMatch('best', {
      name: req.query.name,
      city: req.query.city,
      state: req.query.state,
      country: req.query.country,
      address1: req.query.address
    }).then(response => {

      if(response.jsonBody.businesses[0].id!= undefined)
      {
        var id = response.jsonBody.businesses[0].id;
        //console.log(response.jsonBody.businesses[0]);
        client.reviews(id).then(response => {
          //console.log(response.jsonBody.reviews[0].text);
          console.log(response.jsonBody.reviews);
          res.send(response.jsonBody.reviews);

        }).catch(e => {
          console.log(e);
          res.send({});
        });
        //res.send(response.jsonBody.businesses[0]);
      }

      else {
        res.send({});
      }


    }).catch(e => {
      console.log('Failed search request');
      res.send({});

    });
  //  options.headers =

    //request.get('https://api.yelp.com/v3/businesses/matches/best?')
});

app.get('/nextPageSearch', function(req,res)
    {
        request.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken='+req.query.pagetoken+'&key='+nearby_key,
                    (error,response,body) =>
                        {
                            console.log(body);
                            res.send(body);
                        }
                   );
    });
      
app.get('/geocoding', function(req,res)
        {
            console.log('Geocoding request received');
            if(req.query.lat=== undefined)
            {
                request.get('https://maps.googleapis.com/maps/api/geocode/json?address='+req.query.place+'&key='+geocode_key,
                        (error,response,body) =>
                           {
                    let geocode_json = JSON.parse(body);
                    //console.log(geocode_json.results[0].geometry.location);
                    console.log('Latitude and longitude not set');
                    req.query.lat= geocode_json.results[0].geometry.location.lat;
                    req.query.lon= geocode_json.results[0].geometry.location.lng;
                    nearbysearch(req,res);
                    
                });
            }
            else
            {
                nearbysearch(req,res);
            }
            
        }
       );

function nearbysearch(req, res)
{
    var lat = req.query.lat;
    var lon= req.query.lon;
    var radius= req.query.distance*1600;
    console.log('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+lat+','+lon+'&radius='+radius+'&type='+req.query.category+'&keyword='+req.query.keyword+'&key='+nearby_key);
    
    request.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+lat+','+lon+'&radius='+radius+'&type='+req.query.category+'&keyword='+req.query.keyword+'&key='+nearby_key,
          (error,response,body) =>
          {
            //nearbyinfo = body;
            //console.log(body);
            res.send(body);
            

          });

}

/*
app.get('/nearbysearch', function(req,res)
    {
        console.log('request recieved');
        //console.log(req.body);
        //console.log(req.body.place);
        var lat=0;
        var lon=0;
        var keywordnospace = req.query.keyword;
        //sleep(1000);
        keywordnospace = keywordnospace.replace(/\s/g, '');
        
        lat = req.query.lat;
        lon= req.query.lon;
    

        console.log('Reached here');

        var radius = (req.query.distance)*1600;

        //var next_tok='';
        var nearbyinfo='';
        //console.log('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+lat+','+lon+'&radius='+radius+'&type='+req.body.category+'&keyword='+keywordnospace+'&key='+nearby_key);
        request.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+lat+','+lon+'&radius='+radius+'&type='+req.query.category+'&keyword='+req.query.keyword+'&key='+nearby_key,
          (error,response,body) =>
          {
            nearbyinfo = body;
            res.send(body);
            

          });

        //res.send(nearbyinfo);

    }
)*/

app.listen(3154,function(){
  console.log('Listening mate');
});
