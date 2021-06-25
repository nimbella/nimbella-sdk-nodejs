/**
 * Copyright (c) 2020-present, Nimbella, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var redis = require('redis');
var bluebird = require('bluebird');
const { getStorageProvider } = require('@nimbella/storage');
const Redisqlite = require("./redisqlite.js")

function makeRedisClient() {
  bluebird.promisifyAll(redis.RedisClient.prototype);
  bluebird.promisifyAll(redis.Multi.prototype);
  const redisHost = process.env['__NIM_REDIS_IP'];
  if (!redisHost || redisHost.length == 0) {
    throw new Error('Key-Value store is not available');
  }
  const redisPassword = process.env['__NIM_REDIS_PASSWORD'];
  if (!redisPassword || redisPassword.length == 0) {
    throw new Error('Key-Value store password is not available');
  }
  const redisParam = { port: 6379, host: redisHost };
  const client = redis.createClient(redisParam);
  if (client == null) {
    throw new Error('Error creating redis client');
  }
  client.auth(redisPassword, function (err, reply) {
    if (err) {
      throw new Error('Error authenticating redis client' + reply);
    }
  });
  return client;
}

// The current contract of makeStorageClientis to return a StorageClient handle.
// This works for all object store implementations (currently GCS and S3)
function makeStorageClient(web = false) {
  const rawCreds = process.env['__NIM_STORAGE_KEY'];
  if (!rawCreds || rawCreds.length == 0) {
    throw new Error('Object store credentials are not available');
  }
  const namespace = process.env['__OW_NAMESPACE'];
  const apiHost = process.env['__OW_API_HOST'];
  if (!namespace || !apiHost) {
    throw new Error(
      'Not enough information in the environment to build an object store client'
    );
  }
  let parsedCreds = undefined;
  try {
    parsedCreds = JSON.parse(rawCreds);
  } catch {
    throw new Error(
      'Object store credentials could not be parsed'
    );
  }
  const provider = parsedCreds.provider || '@nimbella/storage-gcs'
  const providerImpl = getStorageProvider(provider)
  const creds = providerImpl.prepareCredentials(parsedCreds)
  return providerImpl.getClient(namespace, apiHost, web, creds)
}

// Legacy storage client that used to only support Google Cloud Storage.
// This now supports any provider depending on the storage credentials.
async function legacyMakeStorageClient(web = false) {
  const handle = makeStorageClient(web)
  return handle.getImplementation()
}

async function makeSqlClient() {
  const mysql = require('mysql2/promise');
  if (!process.env.__NIM_SQL_KEY) {
    throw new Error('Sql credentials are not available');
  }
  const creds = JSON.parse(process.env.__NIM_SQL_KEY);
  return await mysql.createConnection({
    host: creds.host,
    user: creds.user,
    database: creds.database,
    password: creds.password,
    ssl: {
      ca: creds.serverCaCert,
      cert: creds.clientCert,
      key: creds.clientKey
    }
  });
}


function makeSqliteClient() {
  let client = makeRedisClient()
  return new Redisqlite(client)
}

module.exports = {
  redis: makeRedisClient,
  // Legacy function, returns Promise<Bucket>
  storage: legacyMakeStorageClient,
  // New version of the function, returns the more abstract type StorageClient
  storageClient: makeStorageClient,
  mysql: makeSqlClient,
  esql: makeSqliteClient
};
