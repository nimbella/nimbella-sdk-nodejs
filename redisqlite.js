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

function Redisqlite(redis) {
    this.redis = redis
}

Redisqlite.prototype.exec = function (sql) {
    if (!Array.isArray(sql))
        sql = [sql]
    const redis = this.redis
    return new Promise(function (resolve, reject) {
        redis.send_command("SQLEXEC", sql,
            function (err, res) {
                if (err)
                    reject(err)
                else
                    resolve(res.map(JSON.parse))
            })
    })
}

Redisqlite.prototype.prep = function (sql) {
    const redis = this.redis
    if (!Array.isArray(sql))
        sql = [sql]
    return new Promise(function (resolve, reject) {
        redis.send_command("SQLPREP", sql,
            function (err, res) {
                if (err)
                    reject(err)
                else
                    resolve(res)
            })
    })
}

Redisqlite.prototype.map = function (sql, count) {
    if(count === undefined)
        count = 0
    if (!Array.isArray(sql))
        sql = [sql]
    sql.unshift(count)
    const redis = this.redis
    return new Promise(function (resolve, reject) {
        redis.send_command("SQLMAP", sql,
            function (err, res) {
                if (err)
                    reject(err)
                else
                    resolve(res.map(JSON.parse))
            })
    })
}

Redisqlite.prototype.arr = function (sql, count) {
    if(count === undefined)
        count = 0
    if (!Array.isArray(sql))
        sql = [sql]
    sql.unshift(count)
    const redis = this.redis
    return new Promise(function (resolve, reject) {
        redis.send_command("SQLARR", sql,
            function (err, res) {
                if (err)
                    reject(err)
                else
                    resolve(res.map(JSON.parse))
            })
    })
}

module.exports = Redisqlite
