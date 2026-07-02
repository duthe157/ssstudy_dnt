
const compression = require('compression');
const express = require('express');
const config = require('config');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const app = express();
const device = require('express-device');
const ScheduleService = require('./app/services/ScheduleService');
const { startSuspensionWorker } = require('./app/services/BookIdSuspensionService');
const AutoIncrementService = require('./app/services/AutoIncrementService');
const questionWord = require('./app/models/QuestionWord').model;
const ExamWordModel = require('./app/models/ExamWord');

app.use(device.capture());
app.use(compression());

app.set('port', process.env.PORT || config.server.port);

app.use(helmet.frameguard());
app.use(helmet.xssFilter());
app.use(helmet.noSniff());
app.use(helmet.ieNoOpen());
app.use(helmet.hidePoweredBy());

app.disable('x-powered-by');
app.enable('trust proxy');
app.set('trust proxy', true);

require('./config/global');


app.all('/*', (req, res, next) => {
    if (req.url == '/hook/payment') {
        if (req.method == 'POST') {
            var jsonString = '';
            req.on('data', function (data) {
                jsonString += data;
            });
            req.on('end', function () {
                // console.log(jsonString);
            });
        }
    }
    res.header('Content-Type', 'application/json');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', 2592000);

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res._statusCode = 200;
        res.end();
    } else {
        next();
    }
});

const CreditController = require('./app/controllers/CreditController');
app.post('/hook/payment', bodyParser.text({ type: '*/*' }), async (req, res) => {
    await CreditController['hook'](req, res, req.body);
    return;
});

app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(require('./app/routes/routes'));

require('./db/mongo');

// Testing

const server = app.listen(config.get('server.port'), config.get('server.host'), () => {
    console.log('========================================================================');
    console.log('Server start at port:' + server.address().port + ' Time: ' + new Date());
    console.log('========================================================================');
    const service = new ScheduleService();
    startSuspensionWorker();
    setTimeout(async () => {
        try {
            await AutoIncrementService.rebuildExamWordSearchId(ExamWordModel);
        } catch (err) {
            console.error('❌ Error rebuilding ExamWord search_id on startup:', err);
        }
    }, 2000);
    monitor.notifyErrorFunction(process.env.NODE_ENV + '=================Server start at port:'
        + server.address().port + ' Time: ' + new Date());
    service.startSchedule();
});

module.exports = app;
