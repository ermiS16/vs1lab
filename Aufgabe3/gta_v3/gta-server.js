/**
 * Template für Übungsaufgabe VS1lab/Aufgabe3
 * Das Skript soll die Serverseite der gegebenen Client Komponenten im
 * Verzeichnisbaum implementieren. Dazu müssen die TODOs erledigt werden.
 */


/**
 * Definiere Modul Abhängigkeiten und erzeuge Express app.
 */
var jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;

var $ = jQuery = require('jquery')(window);

var http = require('http');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var express = require('express');
var app;
app = express();
app.use(logger('dev'));
//, type: 'application/x-www-form-urlencoded'
app.use(bodyParser.urlencoded({extended: false}));
// Setze ejs als View Engine
app.set('view engine', 'ejs');

/**
 * Konfiguriere den Pfad für statische Dateien.
 * Teste das Ergebnis im Browser unter 'http://localhost:3000/'.
 */

app.use(express.static(__dirname + "/public"));

/**
 * Konstruktor für GeoTag Objekte.
 * GeoTag Objekte sollen min. alle Felder des 'tag-form' Formulars aufnehmen.
 */

function GeoTagObject(latitude, longitude, name, hashtag) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.name = name;
    this.hashtag = hashtag;

    var getLatitude = function(){
        return this.latitude;
    }
    var getLongitude = function(){
        return this.longitude;
    }

    var getName = function(){
        return this.name;
    }

    var getHashtag = function(){
        return this.hashtag;
    }


}

/**
 * Modul für 'In-Memory'-Speicherung von GeoTags mit folgenden Komponenten:
 * - Array als Speicher für Geo Tags.
 * - Funktion zur Suche von Geo Tags in einem Radius um eine Koordinate.
 * - Funktion zur Suche von Geo Tags nach Suchbegriff.
 * - Funktion zum hinzufügen eines Geo Tags.
 * - Funktion zum Löschen eines Geo Tags.
 */

var inMemory = (function() {
    /**
     * private Members
     * @type {Array}
     */
        var taglist = [];
        var filterTaglist = [];
        const ERDRADIUS = 6.371;
    /**
     * public Members
     */
    return {
        getTaglist: function(){
            return taglist;
        },

        getFilterTaglist: function(){
            return filterTaglist;
        },

        addGeoTag: function (geoTagObject) {
            var geoTagExist = false;
            for (var i = 0; i < taglist.length; i++) {
                if (taglist[i].name === geoTagObject.name) {
                    geoTagExist = true;
                }
            }
            if (!geoTagExist) {
                taglist.push(geoTagObject);
                console.log(taglist[0]);
            }
        },

        removeGeoTag: function (geoTagObject) {
            for (var i = 0; i < taglist.length; i++) {
                if (taglist[i].name === geoTagObject.name) {
                    taglist.splice(i);
                }
            }
        },

        searchName : function(argument){
            filterTaglist = [];
            for (var i = 0; i < taglist.length; i++){
                if(taglist[i].name === argument || taglist[i].hashtag === argument) {
                    filterTaglist[i] = taglist[i];
                }
            }
        },

        searchRadius : function(lat, long, radius){
                var returnArray = [];
                var lambda = [];
                var phi = [];
                var x = [];
                var y = [];
                var z = [];
                var distance;
                lambda[0] = lat * Math.PI / 180;
                phi[0] = long * Math.PI / 180;
                x[0] = Math.round(ERDRADIUS * Math.cos(phi[0]) * Math.cos(lambda[0]));
                y[0] = Math.round(ERDRADIUS * Math.cos(phi[0]) * Math.sin(lambda[0]));
                z[0] = Math.round(ERDRADIUS * Math.sin(phi[0]));
                x[0] /= 1000;
                y[0] /= 1000;
                z[0] /= 1000;

                for (var index in taglist) {
                    lambda[1] = lat * Math.PI / 180;
                    phi[1] = long * Math.PI / 180;
                    x[1] = Math.round(ERDRADIUS * Math.cos(phi[1]) * Math.cos(lambda[1]));
                    y[1] = Math.round(ERDRADIUS * Math.cos(phi[1]) * Math.sin(lambda[1]));
                    z[1] = Math.round(ERDRADIUS * Math.sin(phi[1]));
                    x[1] /= 1000;
                    y[1] /= 1000;
                    z[1] /= 1000;
                    distance = (2 * ERDRADIUS / 1000) * Math.asin(Math.sqrt(Math.pow((x[0] - x[1]), 2) + Math.pow((y[0] - y[1]), 2)
                        + Math.pow((z[0] - z[1]), 2)) / (2 * ERDRADIUS / 1000)) * 1000;

                    console.log(distance + " " + radius);
                    console.log("x: "+x[0]+" y: "+y[0] +" z: "+z[0])
                    console.log("x: "+x[1]+" y: "+y[1] +" z: "+z[1])

                    if (distance<=radius*1000){
                        returnArray.push(taglist[index]);
                    }
                }

                return returnArray;


            },
        getRadius : function(lat, lon){

        }
    }
})();

/**
 * Route mit Pfad '/' für HTTP 'GET' Requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests enthalten keine Parameter
 *
 * Als Response wird das ejs-Template ohne Geo Tag Objekte gerendert.
 */

app.get('/', function(req, res) {
    res.render('gta', {
        taglist: []
    });
});

/**
 * Route mit Pfad '/tagging' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'tag-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Mit den Formulardaten wird ein neuer Geo Tag erstellt und gespeichert.
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 */

app.post('/tagging', function(req, res){
    console.log(req.body);
    var newGeoTagObject = new GeoTagObject(req.body.latitude, req.body.longitude, req.body.name, req.body.hashtag);
    inMemory.addGeoTag(newGeoTagObject);
    /*
    var geoTags = [];
    for(var i=0; i< inMemory.getTaglist().length; i++){
        var geoTag = {
            latitude : inMemory.getTaglist()[i].latitude,
            longitude: inMemory.getTaglist()[i].longitude,
            name: inMemory.getTaglist()[i].name,
            hashtag: inMemory.getTaglist()[i].hashtag
        };
        geoTags[i] = geoTag;
    }
    console.log(geoTags);
*/
/*
    var latitude = req.body.latitude;
    var longitude = req.body.longitude;
    console.log(latitude, longitude);
    $("#latitude").attr("value", "hallo");
    $("#longitude").attr("value", longitude);
    console.log($("#latitude").attr("value"));
*/
    /*
    var taglist_json = JSON.stringify(geoTags);
    console.log(taglist_json);
    console.log(JSON.parse(taglist_json));
    $("#result-img").data("tags", taglist_json);
    console.log($("#result-img").data("tags"))
    */
    res.render('gta', {
        taglist: inMemory.getTaglist()})
});

/**
 * Route mit Pfad '/discovery' für HTTP 'POST' Requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests enthalten im Body die Felder des 'filter-form' Formulars.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Als Response wird das ejs-Template mit Geo Tag Objekten gerendert.
 * Die Objekte liegen in einem Standard Radius um die Koordinate (lat, lon).
 * Falls 'term' vorhanden ist, wird nach Suchwort gefiltert.
 */

app.post('/discovery', function(req, res) {

    console.log(req.body);
    console.log(req.body.searchField);
    if(req.body.searchField == '') console.log("Empty");
    if(req.body.searchField !== null){
        inMemory.searchName(req.body.searchField);
    }
    const radius = 0.31;
    if(req.body.searchField == '') {
        console.log("else");
        inMemory.searchRadius(req.body.hiddenLatitude, req.body.hiddenLongitude, radius);
    }

    //inMemory.searchRadius(req.body.hiddenLatitude, req.body.hiddenLongitude);
    res.render('gta', {
        taglist: inMemory.getFilterTaglist()})

});


/**
 * Setze Port und speichere in Express.
 */

var port = 3000;
app.set('port', port);

/**
 * Erstelle HTTP Server
 */

var server = http.createServer(app);

/**
 * Horche auf dem Port an allen Netzwerk-Interfaces
 */

server.listen(port);
