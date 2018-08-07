var MongoClient = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const CONNECTION_STRING = process.env.DB;

//Threads
const newThread = (board, text, delete_password, next) => {
  MongoClient.connect(CONNECTION_STRING, (err, db) => {
    if(err){ return next({error: 'DB Error, new thread'})}
    const dbo = db.db('freecodecamp');
    const collection = dbo.collection(board);
    
    const new_thread = { text: text,
                         created_on: Date(),
                         bumped_on: Date(),
                         reported: false,
                         delete_password,
                         replies: [] };
    
    collection.insertOne(new_thread, (err, data) => {
      if(err){ return next({error: 'DB Error, new thread'})}
      db.close();
      return next(null, data);
    });
    
  });
};

const reportThread = (board, thread_id, next) => {
  MongoClient.connect(CONNECTION_STRING, (err, db) => {
    if(err){ return next({error: 'DB Error, report thread'})}
    const dbo = db.db('freecodecamp');
    const collection = dbo.collection(board);
    
    const query = { _id: ObjectId(thread_id) };
    const update = { $set: { reported: true } };
    
    collection.updateOne(query, update, (err, data) => {
      if(err){ return next({error: 'DB Error, report thread'})}
      db.close();
      return next(null, data);
    });
    
  });
};

const getThread = (board, next) => {
  MongoClient.connect(CONNECTION_STRING, (err, db) => {
    if(err){ return next({error: 'DB Error, get thread'})}
    const dbo = db.db('freecodecamp');
    const collection = dbo.collection(board);
    
    const exclude = {reported: 0, delete_password: 0, 'replies.reported': 0, 'replies.delete_password': 0};
    collection.find({}, exclude).sort({ bumped_on: -1 }).limit(10).toArray((err, data) => {
      if(err){ return next({error: 'DB Error, get thread'})}
      db.close();
      
      //filter replies
      for(let i = 0; i < data.length; i++) {
        data[i].replies.sort((a, b) => {
          return Date.parse(b.created_on) - Date.parse(a.created_on);
        });
        data[i].replies = data[i].replies.slice(0, 3);
      }
      
      return next(null, data);
    });
  });
};

const deleteThread = (board, thread_id, delete_password, next) => {
  MongoClient.connect(CONNECTION_STRING, (err, db) => {
    if(err){ return next({error: 'DB Error, delete thread'})}
    const dbo = db.db('freecodecamp');
    const collection = dbo.collection(board);
    
    const query = { _id: ObjectId(thread_id), delete_password: delete_password };
    
    collection.deleteOne(query, (err, data) => {
      if(err){ return next({error: 'DB Error, delete thread'})}
      db.close();
      //console.log(data.deletedCount);
      return next(data);
    })
  });
};

//Replies
const newReply = (board, thread_id, text, delete_password, next) => {
  MongoClient.connect(CONNECTION_STRING, (err, db) => {
    if(err){ return next({error: 'DB Error, create reply'})}
    const dbo = db.db('freecodecamp');
    const collection = dbo.collection(board);
    
    const datetime = Date();
    const query = { _id: ObjectId(thread_id)};
    const update = { $set: { bumped_on: datetime },
                     $push: { replies: { _id: new ObjectId(),
                                         text: text,
                                         created_on: datetime,
                                         delete_password: delete_password,
                                         reported: false }}};
    
    collection.updateOne(query, update, (err, data) => {
      if(err){ return next({error: 'DB Error, create reply'})}
      db.close();
      return next(null, data);
    });
  });
};

const reportReply = (board, thread_id, reply_id, next) => {
  MongoClient.connect(CONNECTION_STRING, (err, db) => {
    if(err){ return next({error: 'DB Error, report reply'})}
    const dbo = db.db('freecodecamp');
    const collection = dbo.collection(board);
    
    const query = { _id: ObjectId(thread_id), 'replies._id': ObjectId(reply_id) };
    const update = { $set: { 'replies.$.reported': true }};
    collection.updateOne(query, update, (err, data) => {
      if(err){ return next({error: 'DB Error, report reply'})}
      db.close();
      return next(null, data);
    });
  });
};

const getReply = (board, thread_id, next) => {
  MongoClient.connect(CONNECTION_STRING, (err, db) => {
    if(err){ return next({error: 'DB Error, get all replies'})}
    
    const dbo = db.db('freecodecamp');
    const collection = dbo.collection(board);
    
    collection.findOne({}, { reported: 0, delete_password: 0, 'replies.reported': 0, 'replies.delete_password': 0 }, (err, data) => {
      if(err){ return next({error: 'DB Error, get all replies'})}
      db.close();
      return next(null, data);
    });
  });
};

const deleteReply = (board, thread_id, reply_id, delete_password, next) => {
  MongoClient.connect(CONNECTION_STRING, (err, db) => {
    if(err){ return next({error: 'DB Error, delete reply'})}
    const dbo = db.db('freecodecamp');
    const collection = dbo.collection(board);
    
    const query = { _id: ObjectId(thread_id), 'replies._id': ObjectId(reply_id), 'replies.delete_password': delete_password };
    const update = { $set: { 'replies.$.text': '[deleted]' }};
    collection.updateOne(query, update, (err, data) => {
      if(err){ return next({error: 'DB Error, delete reply'})}
      db.close();
      return next(null, data);
    });
  });
};

module.exports = {
  newThread: newThread,
  reportThread: reportThread,
  getThread: getThread,
  deleteThread: deleteThread,
  
  newReply: newReply,
  reportReply: reportReply,
  getReply: getReply,
  deleteReply: deleteReply
}