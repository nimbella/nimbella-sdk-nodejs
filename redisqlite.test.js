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

var sql

beforeAll(async () => {
    process.env['__NIM_REDIS_IP'] = '127.0.0.1'
    process.env['__NIM_REDIS_PASSWORD'] = 'password'
    sql = require('./index.js').esql()
})

beforeEach(async () => {
    sql.exec("drop table t").catch(x => true)
})

afterAll(async() => {
    await sql.redis.quitAsync()
})

test("basic", async () => {

    let res = await sql.exec("create table t(i int)")
    //console.log(res)
    expect(res.length).toBe(2)

    let ins = await sql.exec("insert into t(i) values(1),(2),(3)")
    //console.log(ins[0],typeof(ins[0]), ins[1], typeof(ins[1]))
    expect(ins).toStrictEqual([3,3])

    let m = await sql.map("select * from t")
    //console.log(m)
    expect(m).toStrictEqual([{i:1},{i:2},{i:3}])

    let m1 = await sql.map("select * from t", 1)
    //console.log(m)
    expect(m1).toStrictEqual([{i:1}])

    let m2 = await sql.map("select * from t", 2)
    //console.log(m)
    expect(m2).toStrictEqual([{i:1},{i:2}])

    let a = await sql.arr("select * from t")
    //console.log(a)
    expect(a).toStrictEqual([[1],[2],[3]])

    let a1 = await sql.arr("select * from t",1)
    //console.log(a)
    expect(a1).toStrictEqual([[1]])

    let a2 = await sql.arr("select * from t",2)
    //console.log(a)
    expect(a2).toStrictEqual([[1],[2]])

})

test("with args", async () => {

    let res = await sql.exec("create table t(i int)")
    //console.log(res)
    expect(res.length).toBe(2)

    let ins = await sql.exec(["insert into t(i) values(?),(?),(?)",1,2,3])
    //console.log(ins[0],typeof(ins[0]), ins[1], typeof(ins[1]))
    expect(ins).toStrictEqual([3,3])

    let m = await sql.map(["select * from t where i>?",1])
    //console.log(m)
    expect(m).toStrictEqual([{i:2},{i:3}])

    let m1 = await sql.map(["select * from t where i>?",1],1)
    //console.log(m)
    expect(m1).toStrictEqual([{i:2}])

    let a = await sql.arr(["select * from t where i<?",3])
    //console.log(a)
    expect(a).toStrictEqual([[1],[2]])

    let a1 = await sql.arr(["select * from t where i<?",3],1)
    //console.log(a)
    expect(a1).toStrictEqual([[1]])
})

test("prepared", async () => {

    await sql.exec("create table t(i int, s varchar)")

    let sel = await sql.prep("select s from t where i <?")
    //console.log(ins)
    expect(typeof sel).toBe('number')

    let ins = await sql.prep("insert into t(i, s) values(?,?)")
    //console.log(ins)
    expect(typeof ins).toBe('number')

    await sql.exec([ins, 1, 'a'])
    await sql.exec([ins, 2, 'b'])
    await sql.exec([ins, 3, 'c'])

    let m = await sql.map([sel, 3])
    //console.log(m)
    expect(m).toStrictEqual([ { s: 'a' }, { s: 'b' } ])

    let a = await sql.arr([sel, 3],1)
    //console.log(a)
    expect(a).toStrictEqual([ [ 'a' ] ])

    // todo unprep
    let ok = await sql.prep(sel)
    expect(ok).toBe('OK')
    await sql.prep(ins)
    sql.prep(sel).catch(e => expect(e.message).toBe('invalid prepared statement index'))
})

test("errors", async() => {
    sql.exec("xxx").catch(e => expect(e.message).toBe('near "xxx": syntax error'))
    sql.prep("xxx").catch(e => expect(e.message).toBe('near "xxx": syntax error'))
    sql.map("xxx").catch(e => expect(e.message).toBe('near "xxx": syntax error'))
    sql.arr("xxx").catch(e => expect(e.message).toBe('near "xxx": syntax error'))
})