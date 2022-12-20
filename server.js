const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
    console.log(err.name, err.message);
    console.log('Uncaught Exception! Application is shutting down!');
    process.exit(1);
  });

dotenv.config({ path: './.env' });
const app = require('./app');
const PORT = 3000;

const server = app.listen((process.env.PORT || PORT), () => {
  console.log(`Portfolio is running at port: ${PORT} in ${process.env.ENV} mode`);
});


process.on('unhandledRejection', (err) => {
    console.log(err.name, err.message);
    console.log('Unhandled Error! Application is shutting down!');
    server.close(() => {
      process.exit(1);
    });
  });
  
process.on('SIGTERM', () => {
    console.log('SIGTERM RECEIVED! Application is shutting down!');
    server.close(() => {
      console.log('Process Terminated!');
    });
  });
  