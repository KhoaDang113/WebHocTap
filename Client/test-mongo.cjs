const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://tsmdoubleliff_db_user:EthernalStrife12@cluster0.hbpgiqg.mongodb.net/webhoctap?retryWrites=true&w=majority';
const client = new MongoClient(uri);
async function run() {
  await client.connect();
  const db = client.db('webhoctap');
  const collection = db.collection('otp_sessions');
  const otp = await collection.findOne({ email: 'superadmin@gmail.com', purpose: 'LOGIN' });
  console.log(otp.otpCode);
  await client.close();
}
run();
