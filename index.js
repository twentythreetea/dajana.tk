const express = require("express");
const app = express();
const msu = require("minecraft-server-util");
const {errorHandling} = require('utility');

const morgan = require('morgan');
const favicon = require('serve-favicon');

app.use('/public', express.static('public'));

app.use(morgan('dev'));
app.use(favicon('./public/favicon.png'));

app.disable('case sensitive routing');
app.disable('strict routing');
app.disable('x-powered-by');
app.set('etag', 'strong');
app.set('view engine', 'ejs');

try {
    app.get("/", (req, res, next) => {
        msu.ping('dajana.tk').then(response => {
            // host port version onlinePlayers maxPlayers
            res.render('index', {server: response});
            // res.send(response);
        }).catch(error => {
            next(new errorHandling.SutekinaError(error.code, 500)); 
        });
    });

    app.all('/error', (req, res, next) => {
        throw new errorHandling.SutekinaStatusError(420)
    });
} catch (err) {
    app.use((req, res, next) => next(err));
}

app.use((req, res, next) => next(new errorHandling.SutekinaStatusError(404)));

const debug = require("debug")("MOMO:ERROR");

app.use((err, req, res, next) => {
    debug(err);
    body = {
        code: err.status || err.statusCode || 500,
        message: err.message || err
    };
    console.log(body.message)
    if(body.message == "ENOTFOUND") body.message = "The server is offline.";
    res.statusMessage = errorHandling.ErrorStatusCodes[body.code];
    res.status(body.code).render('index', {error: body});
});

app.listen(8888);
