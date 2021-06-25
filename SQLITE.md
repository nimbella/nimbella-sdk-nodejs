# Embedded SQL Database 

You can access embedded sql with:
  
```
let nim = require("@nimbella/sdk")
const sql = nim.esql()
```

Available methods are:

- `exec(args)` args either string or array 

You can  execute a statement:

```
let res = await sql.exec("create table t(i int)")
```

It returns a promise of `[lastId, changedRows]`.
Values are significant where relevant (for insert or delete but not for create for example).

You can also execute a parametric statement and specify parameters passing an array as first argument:

```
res = await sql.exec(["insert into t(i) values(?)",1])
```

- `map(args [,limit])`, `args` either string or array, `limit` a number

You can execute a query, getting  an array of objects.

```
let m = await sql.map("select * from t")
```

In the result each object corresponds to a record: `[{i:1},{i:2}]` where the keys are the field names, and the values the field values.

You can also pass parameters using an array as first argument, and limit the number of returned elements with an integer as second argument:

```
m = await sql.map(["select * from t where i >?",],1)
```

Result: `[{i:1}]`

- `arr(args [,limit])`, `args` either string or array, `limit` a number

You can execute a query, getting an array of arrays.
Each element in the array corresponds to an array of the record values.
  
```  
let m = await sql.map("select * from t")
```
Result: `[[1],[2]]`

You can also pass parameters using an array as first argument, and limit the number of returned elements with an integer as second argument:

```
m = await sql.map(["select * from t where i >?",],1)
```
Result: `[[1]]`

- `prep(arg)` where `arg` is either a string or a numer  

You can prepare statements to save time from precompiling.

```
let ins = await sql.prep("insert into t(i) values(?)")
let sel = await sql.prep("select * from t where i>?")
```

The returned value is a number and can be used to execute the statement with `exec`, `map` and `arr`.

```
res = await sql.exec([ins,1])
m = await sql.map([sel,1],1)
```

When you do not need any more you can close the statement running prep again with the returned value.

```
await sql.prep(ins)
await sql.prep(sel)
```

Note that you can prepare up to 10000 statement at the same time without closing them, otherwise you will get an error `too many prepared statement`. In the unfortunate accident you fill the cache, you can clear it with `prep("clean_prep_cache")`
