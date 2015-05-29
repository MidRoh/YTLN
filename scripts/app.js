$ytApp=angular.module('ytApp', ['ngRoute', 'ngSanitize'])
 .config(['$routeProvider','$locationProvider', 
	function($routeProvider, $locationProvider){

	    $routeProvider.
			when('/SimpleAngularApp/index.html', {
			    templateUrl: 'views/tv.html',
			    controller: 'TvCtrl'
			}).
	        when('/SimpleAngularApp/guide.html', {
	            templateUrl: 'views/guide.html',
	            controller: 'GuideCtrl'
	        });

	    //These need to be set as I am trying to develop this as a standalone app. These options get rid of #'s in the urls and disable the requiring of a base tag, respectively.
	    //This allows it to run on any localhost:portnumber/ url
	    $locationProvider.html5Mode({
	        enabled: true,
	        requireBase: false
	    });
	}])
.run(['$rootScope', function ($rootScope) {
    //this initializes the path variable because the browser will evaluate the document and see {{path}} in the dom, show an error, then load the video a moment later.
    //This way, it just appears blank for a split second then loads the video instead of showing an unattractive error screen in the youtube window
    $rootScope.path = "";
}])
 .controller('TvCtrl', ['$scope', '$sce', 'broadcastFactory', 'videoFactory', function ($scope, $sce, broadcastFactory, videoFactory) {

     broadcastFactory.getBroadcasts().success(function (data) {
        

         $scope.broadcasts = videoFactory.getLiveBroadcasts(data);
         console.log($scope.broadcasts);
         var i = videoFactory.getChannel();
            var limit = $scope.broadcasts.length;
        
            if (videoFactory.getPath() == 0) {
                videoFactory.setVideoId($scope.broadcasts[i].videoId);
         }         

         $scope.path = $sce.trustAsResourceUrl(videoFactory.getPath());

         $scope.channelUp = function () {           
             console.log("up: " + i);
             if (i == limit) {
                 i = 0;
                 videoFactory.setChannel(i);
             }
             else {
                 i++;
                 videoFactory.setChannel(i);
             }
             videoFactory.setVideoId($scope.broadcasts[i].videoId);
             $scope.path = $sce.trustAsResourceUrl(videoFactory.getPath());
                 
         }
         $scope.channelDown = function () {            
             console.log("up: " + i);
             if (i == 0) {
                 i = limit - 1;
                 videoFactory.setChannel(i);
             }
             else {
                 i--;
                 videoFactory.setChannel(i);
             }
             videoFactory.setVideoId($scope.broadcasts[i].videoId);
             $scope.path = $sce.trustAsResourceUrl(videoFactory.getPath());
         }

     }).error(function () { console.log("err");});
 }])
.controller('GuideCtrl', ['$scope', '$location', 'broadcastFactory', 'videoFactory', function ($scope, $location, broadcastFactory, videoFactory) {
     var guide = this;
     broadcastFactory.getBroadcasts().success(function (data) {
         guide.broadcasts = videoFactory.getLiveBroadcasts(data);
        
         $scope.loadBroadcast = function (id) {           
             videoFactory.setVideoId(id);
             videoFactory.setChannel(guide.broadcasts.videoId);
             $location.path('/SimpleAngularApp/index.html');

         }
     });
 }])
.factory('broadcastFactory', ['$http', function ($http) {
    return{
        getBroadcasts: function () {
            return $http.get('https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&order=date&type=video&key=AIzaSyDlpHvXhZuGYZTDYXkTeGLfwVjGI15iJiU');
        }               
    }

}])
.factory('videoFactory', [function () {
    var videoId = 0;
    var channel = 0;
    return {
        getLiveBroadcasts: function (data) {
            var liveBroadcasts = [];
            var i = 0;
            //Currently the YouTube api V3 does not support a query for a list of live broadcasts.
            //There is a way to search for live brodcasts, but only on a specific channel and it requires OAUTH 2 headers to query.
            //For this app, I wanted the live broadcasts to be random, public broadcasts of whatever is currently being streamed.
            //So this is here to build a list live broadcasts by checking the liveBroadCastContent element
            //that is returned from a broad video search.
            angular.forEach(data.items, function (value, key) {
                if (value.snippet.liveBroadcastContent == "live") {
                    liveBroadcasts.push({
                        "id": i,
                        "videoId" :value.id.videoId,
                        "title": value.snippet.title,
                        "thumb": value.snippet.thumbnails.default.url,
                        "desc": value.snippet.description,
                        "chTitle": value.snippet.channelTitle,
                        "publishedAt" : value.snippet.publishedAt
                    });
                    i++;
                }
            });
            return liveBroadcasts;
        },
        getPath: function () {
            if (videoId == 0)
                return 0;
            else
                return 'https://www.youtube.com/embed/' + videoId + '?autoplay=1';
        },
        getChannel:function(){
            return channel;
        },
        setVideoId : function (newId) {
            videoId = newId;
            return true;
        },
        setChannel: function (index) {
            channel = index;
            return true;
        }
    }
}])
;
 