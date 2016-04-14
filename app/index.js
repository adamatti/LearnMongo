//https://docs.mongodb.org/getting-started/node/update/
"use strict";

const config = require("./config"),
      logger = require("log4js").getLogger("index"),
      Promise = require("bluebird"),      
      uuid = require('uuid-v4'),
      mongodb = require('mongodb'),
      mongoClient = mongodb.MongoClient,
	  collection = mongodb.Collection
;

////////////////////////////////////////////////////////// Magic stuffs to make promises work
Promise.promisifyAll(collection.prototype);
Promise.promisifyAll(mongoClient);
collection.prototype._find = collection.prototype.find;
collection.prototype.find = function() {
    var cursor = this._find.apply(this, arguments);
    cursor.toArrayAsync = Promise.promisify(cursor.toArray, cursor);
    cursor.countAsync = Promise.promisify(cursor.count, cursor);
    return cursor;
}
////////////////////////////////////////////////////////// 

var obj = {
	_id : uuid(),
	name:"adamatti"
}
var scope = {}
return mongoClient.connectAsync(config.mongo.url)
.then(db =>{
	scope.db = db;
	scope.collection = db.collection("test");
	logger.info("Connected to DB");
	return scope.collection.insertAsync(obj);
}).then(row => {
	logger.info("Obj inserted: ",row.result.ok);	
	row.name="marcelo";
	return scope.collection.updateOneAsync({_id:obj._id},obj);
}).then(row => {
	logger.info("Obj updated: ",row.result.ok);
	logger.info("Finding by id %s",obj._id);
	return scope.collection.findOneAsync({_id:obj._id});
}).then(row => {
	logger.info("Found one: ",row);
	return scope.collection.find().toArrayAsync();
}).then(rows => {
	logger.info("Found rows: ",rows);
	return scope.collection.removeAsync({_id:obj._id});
}).then(result => {
	logger.info("Removed: ",result.result.ok);
}).catch(err => {
	logger.error("Error: ", err);
})
