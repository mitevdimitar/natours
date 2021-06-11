const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err)=> {
  console.log('Uncaught Exception!');
  console.log(err.name, err.message);
  process.exit(1)
})

dotenv.config({
  path: './.env',
})

const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
  useNewUrlParser:true,
  useCreateIndex:true,
  useFindAndModify:false,
  useUnifiedTopology: true
}).then(()=>console.log('Successfully logged to database!'))
  .catch((err)=>console.log(err));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});

process.on('unhandledRejection', (err)=> {
  console.log('Unhandled Rejection!');
  console.log(err.name, err.message);
  server.close(()=> {
    process.exit(1)
  })
})