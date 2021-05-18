# Nimbella SDK for Node.js

A Node.js library to interact with [`nimbella.com`](https://nimbella.com) services.

## Installation

```
npm install @nimbella/sdk
```

## Usage

```js
const nim = require('@nimbella/sdk');

async function main(args) {
  // Redis
  const redis = nim.redis();
  await redis.setAsync('key', 'value');
  const value = await redis.getAsync('key');

  // Storage
  const bucket = await nim.storage();
  const file = bucket.file('hello.txt'); // Filename
  await file.save('Hello world!'); // Contents

  // Database (MySQL)
  const db = await nim.mysql(); // Returns a configured mysql2 connection.
  const [rows, fields] = await db.execute('SELECT * FROM `table`');

  // Embedded Database (Sqlite)
  const sql = nim.sqlite()
  // execute a statement 
  // it returns [lastId, changedRows] where relevant 
  let res = await sql.exec("create table t(i int)")
  // execute a parametric statement with parameters
  res = await sql.exec(["insert into t(i) values(?)",1])
  // execute a query, returns an array of objects
  // each object corresponds to a record: [{i:1},{i:2}] 
  let m = await sql.map("select * from t")
  // you can also pass parameters 
  // and limit the number of returned elements
  m = await sql.map(["select * from t where i >?",],1) // [{i:1}]
  // execute a query, returns an array of arrays
  // each array corresponds to record values: [[1],[2]] 
  let m = await sql.arr("select * from t")
  // you can also pass parameters 
  // and limit the number of returned elements
  m = await sql.arr(["select * from t where i >?",],1) // [[1]]
  // you can prepare statements
  let ins = await sql.prep("insert into t(i) values(?)")
  let sel = await sql.prep("select * from t where i>?")
  // the returned value is a number and can be used to execute 
  res = await sql.exec([ins,1])
  m = await sql.map([sel,1],1)
  // when you do not need any more close the statement 
  // running prep again with the returned value
  await sql.prep(ins)
  await sql.prep(sel)
}
```

## Support

We're always happy to help you with any issues you encounter. You may want to [join our Slack community](https://nimbella-community.slack.com/) to engage with us for a more rapid response.

## License

Apache-2.0. See [LICENSE](LICENSE) to learn more.
