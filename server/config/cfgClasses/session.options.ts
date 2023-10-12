import { SessionOptions } from 'express-session';

const sessionOptions: SessionOptions = {
  name: 'SID',
  secret: 'SejIDFm3S6D5fkSVSSXKL234SOejfnekEt',
  resave: true,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 8,
  },
};

export default sessionOptions;
