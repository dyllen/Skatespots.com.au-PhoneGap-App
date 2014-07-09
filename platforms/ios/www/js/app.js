// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers'])

// .config(function (ezfbProvider) {
//   ezfbProvider.setInitParams({
//     appId: '267591593342063',
//     nativeInterface: CDV.FB,
//     useCachedDialogs: false
//   });

//   ezfbProvider.setLoadSDKFunction(function ($document, ezfbAsyncInit) {
//     $document.on('deviceready', function () {
//       ezfbAsyncInit();
//     });
//   });
// })

.run(function($ionicPlatform) {

  // ezfb.init();

  $ionicPlatform.ready(function() {
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'AppCtrl'
    })

    .state('app.search', {
      url: "/search",
      views: {
        'menuContent' :{
          templateUrl: "templates/search.html"
        }
      }
    })

    .state('app.browse', {
      url: "/browse",
      views: {
        'menuContent' :{
          templateUrl: "templates/browse.html"
        }
      }
    })
    .state('app.spots', {
      url: "/spots/:spotType",
      views: {
        'menuContent' :{
          templateUrl: "templates/spots.html",
          controller: 'SpotsCtrl'
        }
      }
    })
    .state('app.parks', {
      url: "/parks",
      views: {
        'menuContent' :{
          templateUrl: "templates/spots.html",
          controller: 'SpotsCtrl'
        }
      }
    })
    .state('app.top', {
      url: "/top",
      views: {
        'menuContent' :{
          templateUrl: "templates/top.html",
          controller: 'topCtrl'
        }
      }
    })
    .state('app.leaderboard', {
      url: "/leaderboard",
      views: {
        'menuContent' :{
          templateUrl: "templates/leaderboard.html",
          controller: 'leaderCtrl'
        }
      }
    })
    .state('app.user', {
      url: "/user/:userId",
      views: {
        'menuContent' :{
          templateUrl: "templates/user.html",
          controller: 'userCtrl'
        }
      }
    })
    .state('app.favourites', {
      url: "/favourites",
      views: {
        'menuContent' :{
          templateUrl: "templates/favourites.html",
          controller: 'favouritesCtrl'
        }
      }
    })
    .state('app.add', {
      url: "/add",
      views: {
        'menuContent' :{
          templateUrl: "templates/add.html"
        }
      }
    })
    .state('app.addform', {
      url: "/addform/:addType",
      views: {
        'menuContent' :{
          templateUrl: "templates/add-form.html",
          controller: 'addCtrl'
        }
      }
    })
    .state('app.login', {
      url: "/login",
      views: {
        'menuContent' :{
          templateUrl: "templates/login.html"
        }
      }
    })
  .state('app.about', {
      url: "/about",
      views: {
        'menuContent' :{
          templateUrl: "templates/about.html",
          controller: 'aboutCtrl'
        }
      }
  })
  .state('app.single', {
      url: "/playlists/:playlistId",
      views: {
        'menuContent' :{
          templateUrl: "templates/spot-content.html",
          controller: 'PlaylistCtrl'
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/spots/spot');
});

