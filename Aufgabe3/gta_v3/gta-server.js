/**
 * Template für Übungsaufgabe VS1lab/Aufgabe3
 * Das Skript soll die Serverseite der gegebenen Client Komponenten im
 * Verzeichnisbaum implementieren. Dazu müssen die TODOs erledigt werden.
 */


/**
 * Definiere Modul Abhängigkeiten und erzeuge Express app.
 */

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

    this.getLatitude = function () {
        return this.latitude;
    };
    this.getLongitude = function () {
        return this.longitude;
    };
    this.getName = function () {
        return this.name;
    };
    this.getHashtag = function () {
        return this.hashtag;
    };

    this.toString = function () {
        return "Latitude: " + this.latitude +
            ", Longitude: " + this.longitude + ", Name: " + this.name + ", Hashtag: " + this.hashtag;

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
                if(taglist[i].getName() === argument || taglist[i].getHashtag() === argument) {
                    filterTaglist[i] = taglist[i];
                }
            }
        },
            /** (Breitengrad:
             * 1 Grad: 71,44kn
             * 1 Bogenminute: 1.190 m
             * 1 Bogensekunde: 19,8 m
             * Laengengrad:
             * 1 Grad: 113,13km
             * 1 Bogenminute: 1.850 m
             * 1 Bogensekunde: 30.9 m
             */
        searchRadius : function(lat, long){
            filterTaglist = [];

            var latit = 71.44;
            var longit = 113.13;
            var radius = 0;
            var latKm= 0.07;
            var longKm = 0.31;
            var standartRadius = 0;
                console.log(latKm, longKm);
                console.log(lat, long);
            for(var i = 0; i<taglist.length;i++){
                var dx = latit * (lat - taglist[i].latitude);
                var dy = longit * (long- taglist[i].longitude);
                radius = Math.sqrt((dx*dx)+(dy*dy));
                standartRadius = Math.sqrt((latKm*latKm)+(longKm*longKm));
                console.log(radius, standartRadius, dx, dy);

                if(radius < standartRadius) filterTaglist[i] = taglist[i];
                console.log(filterTaglist);
            }

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
    if(req.body.searchField == '') {
        console.log("else");
        inMemory.searchRadius(req.body.hiddenLatitude, req.body.hiddenLongitude);
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
