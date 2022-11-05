import createError from 'http-errors';
import express from 'express';
import session from 'express-session';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import { issuerRouter } from './routes/issuer';
import { audienceRouter } from './routes/audience';
import { subjectRouter } from './routes/subject';
import { apiRouter } from './routes/api';

declare module 'express-session' {
  interface SessionData {
    signedJWT: string,
  }
}

const app: express.Application = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('port', '3000');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    name: 'DID JWT Session',
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
  })
)

app.use('/', issuerRouter);
app.use('/audience', audienceRouter);
app.use('/subject', subjectRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req: express.Request, res: express.Response, next: express.NextFunction) {
  next(createError(404));
});

// error handler
app.use(function(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
