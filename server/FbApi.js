/**
 * Created by mariumaskri on 2017-02-13.
 */

const express = require('express');
const router = express.Router();
const configurations = require('../server/config');
const _ = require('underscore');
var graph = require('fbgraph');
var access_token = configurations.access_token;
var app_secret= configurations.app_secret;
var searsFbPageId= configurations.searsFbPageId;
var postIds = [];
const salient = require('salient');
graph.setAccessToken(access_token);
graph.setAppSecret(app_secret);
graph.setVersion("2.8");




router.get('/',function(req,res){
  var responseData;
  var from,to;
  from = new Date(req.query.from+ "T00:00:00");
  if(from == "Invalid Date"){
    console.log("Invalid from date");
    return res.json({data:[],keyConcerns:Object.keys(configurations.keyPhrases),message:"Invalid from date"})
  }
  to = new Date(req.query.to+ "T00:00:00");
  if(to == "Invalid Date"){
    console.log("Invalid to date");
    return res.json({data:[],keyConcerns:Object.keys(configurations.keyPhrases),message:"Invalid to date"})
  }
  graph.get(searsFbPageId+'/posts?since='+req.query.from+'&until='+req.query.to+'&limit=100', function(err, data) {
    if(!err)
      responseData = data;
    else{
      console.log("Error occurred");
      return res.json({error:err});
    }
      console.log("   =========================================================================  ");
    if(responseData.data.length === 0) {
      console.log("No posts found");
      return res.json({data:[],keyConcerns:Object.keys(configurations.keyPhrases),message:"No posts found"});
    }
    console.log(responseData.data.length+ " posts found from " + req.query.from +" to "+ req.query.to);
    postIds = _.pluck(responseData.data,'id');
    var commentsResult = [];
    for(var i=0;i<postIds.length;i++) {
      getAllComments(postIds[i], '', commentsResult, i, postIds.length-1, function (data) {
        var comments = (_.flatten(data));
        if(comments.length === 0) {
          console.log("No comments found");
          return res.json({data:[],keyConcerns:Object.keys(configurations.keyPhrases),message:"No comments found"});
        }
        console.log(comments.length+ " comments found");
        var analyser = new salient.sentiment.BayesSentimentAnalyser();
        var sentimentResults = [];
        var count =0;
        var sentimentScore ='';
        var failed = false;
        var expectedTotal = comments.length;
        comments.map(function(review,index){
          try {
            sentimentScore = analyser.classify(review) <= 0 ? 'Negative' : 'Positive';
          }
          catch(e){
            failed = true;
            expectedTotal--;
          }
          if(!failed){
            sentimentResults.push({sentiment:sentimentScore,text:review,keyPhrases :[]});
            count++;
            Object.keys(configurations.keyPhrases).map(function (keyword) {
              var notInKeyPhrases = true;
              configurations.keyPhrases[keyword].map(function(phrase) {
                if (review.toLowerCase().includes(phrase.toLowerCase()) && notInKeyPhrases) {
                  sentimentResults[sentimentResults.length-1].keyPhrases.push(keyword);
                  notInKeyPhrases = false;
                }
              });
            });
            if(count === expectedTotal && index === comments.length-1) {
              console.log("Total reviews analyzed :: "+ expectedTotal);
              return res.json({data:sentimentResults,keyConcerns:Object.keys(configurations.keyPhrases)});
            }
          }
          else{
            failed = false;
            if(count === expectedTotal && index === comments.length-1) {
              console.log("Total reviews analyzed :: "+ expectedTotal);
              return res.json({data:sentimentResults,keyConcerns:Object.keys(configurations.keyPhrases)});
            }
          }
        });
      });
    }
  });
});

var countRecursiveCalls=0;
getAllComments = function(postId,nextCursor,endResult,index,totalPosts,callback) {
  countRecursiveCalls++;
  var url = postId + '/comments?limit=100';
  if (nextCursor != '') {
    url += '&after=' + nextCursor;
  }
  //console.log(url);
  graph.get(url, function (err, data) {
    if (_.has(data, 'data')) {
      endResult.push(_.pluck(data.data, 'message'));
      if (typeof data.paging != "undefined" && typeof data.paging.cursors.after != 'undefined' && _.has(data.paging.cursors, 'after')) {
        getAllComments(postId, data.paging.cursors.after, endResult,index,totalPosts,callback);
      }
      countRecursiveCalls--;
      if(callback && countRecursiveCalls === 0 ){
        callback(endResult);
      }
    }
  });
}
module.exports = router;
