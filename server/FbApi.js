/**
 * Created by mariumaskri on 2017-02-13.
 */

const express = require('express');
const router = express.Router();
const Promise = require('promise');
const configurations = require('../server/config');
const _ = require('underscore');
var graph = require('fbgraph');
var access_token = configurations.access_token;//"270416960037695|MregvXZREzwvBiVSiJVAWwoQegI";
var app_secret= configurations.app_secret;//"095d6e3f47a8ef029c83d30384fe44c5";
var searsFbPageId= configurations.searsFbPageId;//"111916564193";
var postIds = [];

graph.setAccessToken(access_token);
graph.setAppSecret(app_secret);
graph.setVersion("2.8");


///Just For now
// taking month of december,2016
var since ='2016-12-01';
var until = '2016-12-31';


router.get('/',function(req,res){
  var responseData;
  graph.get(searsFbPageId+'/posts?since='+since+'&until='+until+'&limit=100', function(err, data) {
    if(!err)
      responseData = data;
    else
      responseData = err;
    console.log("Data");
    console.log(responseData.data.length);
    postIds = _.pluck(responseData.data,'id');
    var commentsResult = [];
    for(var i=0;i<postIds.length;i++) {
      if(i+1 == postIds.length) {
        /*getAllComments(postIds[i],commentsResult,function (err,data) {
         if (!err) {
         console.log(i +" ::  Back in callback(comments length):: " + data.length);
         res.json(_.flatten(data));
         }
         });*/
        getAllComments(postIds[i], '', commentsResult, i, postIds.length-1, function (data) {
          console.log(i + " ::  Back in callback(comments length):: " + data.length);
          res.json(_.flatten(data));
        });
      }
      else
        //getAllComments(postIds[i],commentsResult,null);
        getAllComments(postIds[i], '',commentsResult,i,postIds.length-1,null);
    }
  });
});

router.get('/efficient',function(request,response) {
  var endResult = [];
  graph.get(searsFbPageId + '/posts?since=' + since + '&until=' + until + '&limit=100', function (err, data) {
    if (!err)
      responseData = data;
    else
      responseData = err;
    console.log("Data");
    console.log(responseData.data.length);
    postIds = _.pluck(responseData.data, 'id');
    var fbGraphRequests = [];
    for (var i = 0; i <postIds.length; i++) {
      fbGraphRequests.push({method: "GET", relative_url: postIds[i] + '/comments?limit=100'});
    }
    makeBatchFbRequests(fbGraphRequests,function (data) {
      response.json(data);
    });


  });


});


driverMakeBatchRequests = function(fbGraphRequests,callback){
  var totalComments = [];
  console.log("out. Next Requests:: "+fbGraphRequests.length);
  var totRequests = fbGraphRequests.length;
  while(totRequests!= 0){//fbGraphRequests.length!=0) {
    console.log("in. Next Requests:: "+fbGraphRequests.length);
    callGraphApi(fbGraphRequests).then(function (data) {
      console.log("again");
      console.log(data);
      first=false;
      var parsedBody = (_.pluck(data, 'body')).map(JSON.parse);
      console.log("Parsing done")
      totalComments = _.flatten(_.pluck(parsedBody, 'data').map(function (item, index, array) {
        return _.pluck(item, 'message');
      }));
      console.log("Tot Comments:: " + totalComments.length);
      console.log("fetching next requests");
      fbGraphRequests = getNextFbRequests(parsedBody,fbGraphRequests);
    }).catch(function (error) {
      callback(error)
    });
    totRequests = fbGraphRequests.length;
    if(totRequests === 0 ){
      break;
    }
  }
}


callGraphApi = function(fbRequests){
  //console.log('relative_ur :: '+fbRequests[0].relative_url);
  return new Promise (function(resolve,reject){
    console.log("graph batch");
    graph.batch(fbRequests,function(error,fbResponse){
      console.log("error::");
      console.log(error);
      if(error){
        reject(error);
      }
      resolve(fbResponse);
    });
  })
};

getNextFbRequests = function(data,fbGraphRequests,callback){
  console.log("Paging");
  console.log(_.pluck(data, 'paging'));
  var fbRequests = (_.pluck(data, 'paging').map(function (item, index, array) {
    console.log(item != "undefined" && _.has(item,'cursors'));
    if(item != "undefined" && _.has(item,'cursors'))
        return fbGraphRequests[index].relative_url += "&after=" + item.cursors.after;
    }));
  console.log("Next Requests:: "+fbRequests.length);
  return (fbRequests);
}


makeBatchFbRequests = function(fbGraphRequests,callback){

  var endResult =[];
  makeBatchFbRequestsRecursion(fbGraphRequests,endResult).then(function(data){
    callback(data);
  }).catch(function(){
    callback({error:"Failed"});
  });
}
makeBatchFbRequestsRecursion = function(fbGraphRequests,endResult){
  return new Promise(function(resolve,reject){
  graph.batch(fbGraphRequests, function (err, fbResponse) {
    if (!err) {
      var data = (_.pluck(fbResponse, 'body')).map(JSON.parse);
      if(data.length !=0 &&data.paging != "undefined"  ) {


        endResult.push(_.flatten(_.pluck(data, 'data').map(function (item, index, array) {
          return _.pluck(item, 'message');
        })));
        fbGraphRequests = (_.pluck(data, 'paging').map(function (item, index, array) {
          return fbGraphRequests[index].relative_url += "&after=" + item.cursors.after;
        }));
      }
      resolve(endResult);
    }
    else
      reject('Failure');
  })
  });
};
var count =0;
getAllComments = function(postId,nextCursor,endResult,index,totalPosts,callback) {
    count++;
    var url = postId + '/comments?limit=100';
    if (nextCursor != '') {
      url += '&after=' + nextCursor;
    }
    console.log(url);
    graph.get(url, function (err, data) {
      if (_.has(data, 'data')) {
        endResult.push(_.pluck(data.data, 'message'));
        if (typeof data.paging != "undefined" && typeof data.paging.cursors.after != 'undefined' && _.has(data.paging.cursors, 'after')) {
          getAllComments(postId, data.paging.cursors.after, endResult,index,totalPosts,callback);
        }
        count--;
        if( index === totalPosts && callback && count === 0 )
          callback(endResult);
      }
    });
}

// getAllComments = function(postId,endResult,callback){
//   var url=postId+'/comments?limit=100';
//   var response ={};
//   do {
//     console.log(response);
//     if(typeof response.paging != "undefined" && typeof response.paging.cursors.after != 'undefined' && _.has(response.paging.cursors,'after')) {
//       url += '&after='+response.paging.cursors.after;
//     }
//     console.log("url :: "+url);
//     graph.get(url, function (err, data) {
//       console.log(data)
//       endResult.push(_.pluck(data.data, 'message'));
//     }).then(function(responseData){
//       response= responseData;
//
//     });
//   }while(typeof response.paging != "undefined" && typeof response.paging.cursors.after != 'undefined' && _.has(response.paging.cursors,'after'));
//   if(callback != null)
//     callback(null,endResult);
// }


module.exports = router;
