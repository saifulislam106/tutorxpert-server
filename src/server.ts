/* eslint-disable @typescript-eslint/no-unused-vars */
import { Server } from 'http';
import mongoose from 'mongoose';
import { App } from './app';
import config from './app/config';

let server: Server;

async function main() {
  try {
    await mongoose.connect(config.db_url as string);
    // await mongoose.connect('mongodb://localhost:27017/bookGroupPoject');
    server = App.listen(5000, () => {
      console.log(`server running on port ${config.port}`);
    });
  } catch (error) {
    console.log(error);
  }
}
main();
