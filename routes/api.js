/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
const boardHandler = require('./boardHandler.js');

module.exports = function (app) {
  
  app.route('/api/threads/:board')
    .post((req, res) => { //Create Thread
      if(!req.params.board || !req.body.text || !req.body.delete_password) {
        return res.json({ error: 'missing params' });
      }
    
      const board = req.params.board;
      const body = req.body;
      boardHandler.newThread(board, body.text, body.delete_password, (err, data) => {
        if(err){ return res.json(err) }
        //res.json(data.ops[0]);
        return res.redirect(`/b/${board}`);
      });
      
    })
    
    .get((req, res) => { //Get 10 recent Threads and  3 recent Replies
      if(!req.params.board) {
        return res.json({ error: 'missing params' });
      }
    
      const board = req.params.board;
      boardHandler.getThread(board, (err, data) => {
        if(err){ return res.json(err) }
        return res.json(data);
      });
    })
    
    .put((req, res) => { //Report Thread
      if(!req.params.board || !req.body.thread_id ) {
        return res.json({ error: 'missing params' });
      }
      
      const board = req.params.board;
      const body = req.body;
    
      boardHandler.reportThread(board, body.thread_id, (err, data) => {
        if(err){ res.json(err) }
        return res.end('success');
      });
    
    })
    
    .delete((req, res) => { //Delete Thread
      if(!req.params.board || !req.body.thread_id || !req.body.delete_password) {
        return res.json({ error: 'missing params' });
      }
      
      const board = req.params.board;
      const body = req.body;
    
      boardHandler.deleteThread(board, body.thread_id, body.delete_password, (err, data) => {
        if(err){ return res.json(err) }
        
        if(data.deletedCount == 1) {
          return res.end('success');
        } else {
          return res.end('incorrect password');
        }
      });
    });
  
    
  app.route('/api/replies/:board')
    .post((req, res) => { //Create Reply
      if(!req.params.board || !req.body.thread_id || !req.body.text || !req.body.delete_password) {
        return res.json({ error: 'missing params' });
      }
      
      const board = req.params.board;
      const body = req.body;
    
      boardHandler.newReply(board, body.thread_id, body.text, body.delete_password, (err, data) => {
        if(err){ return res.json(err) }
        return res.redirect(`/b/${board}/${body.thread_id}`);
      });
    })
    
    .get((req, res) => { //Get Thread & All Replies
      if(!req.params.board || !req.query.thread_id){
        return res.json({ error: 'missing params' });
      }
    
      const board = req.params.board;
      const thread_id = req.query.thread_id;
    
      boardHandler.getReply(board, thread_id, (err, data) => {
        if(err){ return res.json(err) }
        res.json(data);
      });
    })
    
    .put((req, res) => { //Report Reply
      if(!req.params.board || !req.body.thread_id || !req.body.reply_id) {
        return res.json({ error: 'missing params' });
      }
      
      const board = req.params.board;
      const body = req.body;
    
      boardHandler.reportReply(board, body.thread_id, body.reply_id, (err, data) => {
        if(err){ return res.json(err) }
        res.end('success');
      });
    })
    
    .delete((req, res) => { //Delete Reply
      if(!req.params.board || !req.body.thread_id || !req.body.reply_id || !req.body.delete_password) {
        return res.json({ error: 'missing params' });
      }
    
      const board = req.params.board;
      const body = req.body;
    
      boardHandler.deleteReply(board, body.thread_id, body.reply_id, body.delete_password, (err, data) => {
        if(err){ return res.json(err) }
        if(data.modifiedCount == 1) {
          res.end('success');
        } else {
          res.end('incorrect password');
        }
      });
    });

};