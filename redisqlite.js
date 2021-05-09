function Redisqlite(redis) {
    this.redis = redis
}

Redisqlite.prototype.query = function (sql, count, callback) {
    if (!Array.isArray(sql))
        sql = [sql]
    sql.unshift(count)
    this.redis.send_command("SQLMAP", sql, callback)
}

Redisqlite.prototype.exec = function (sql, callback) {
    if (!Array.isArray(sql))
        sql = [sql]
    this.redis.send_command("SQLEXEC", sql, callback)
}

module.exports = Redisqlite