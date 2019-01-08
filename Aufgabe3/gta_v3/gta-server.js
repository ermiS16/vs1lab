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
app.use(bodyParser.urlencoded({
    extended: false
}));
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
        let taglist = [];

    /**
     * public Members
     */
    return {
        addGeoTag: function (geoTagObject) {
            let geoTagExist = false;
            for (var i = 0; i < taglist.length; i++) {
                if (taglist[i].name === geoTagObject.name) {
                    geoTagExist = true;
                }
            }
            if (!geoTagExist) {
                taglist.push(geoTagObject);
            }
        },

        removeGeoTag: function (geoTagObject) {
            for (var i = 0; i < taglist.length; i++) {
                if (taglist[i].name === geoTagObject.name) {
                    taglist.splice(i);
                }
            }
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

app.post('/tagging', function(req, res) {

    let newGeoTagObject = new GeoTagObject(req.body.latitude, req.body.longitude, req.body.name, req.body.hashtag);
    inMemory.addGeoTag(newGeoTagObject);
    res.render('gta', {
        taglist:[]})

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

    let newGeoTagObject = new GeoTagObject(req.body.latitude, req.body.longitude, req.body.hashtag, req.body.name);

    res.render('gta', {
        taglist: []})

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
