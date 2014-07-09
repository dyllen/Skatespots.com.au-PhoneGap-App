angular.module('starter.controllers', [])

.run(function($ionicPlatform) {
if(navigator.splashscreen){
  $ionicPlatform.ready(function() {
    setTimeout(function() {
        navigator.splashscreen.hide();
    }, 100);
 });
  }
})


.controller('AppCtrl', function ($scope, searchFactory, $ionicPopup, $location, $ionicSideMenuDelegate, $rootScope, $http) {
    $scope.nav = '<img class="title-image" width="150" src="img/logo.png" />';
    $scope.fbResponse = null;

    $scope.$watch(function () {
            return $ionicSideMenuDelegate.getOpenRatio();
        },
        function (ratio) {
            if (ratio == 1) {
                setTimeout(function () {
                    $('#search').removeAttr('disabled');
                }, 400);
            } else {
                $('#search').attr('disabled', 'disabled');
            }
        });

    document.addEventListener("deviceready", onDeviceReady, false);

    function onDeviceReady() {
        try {
            FB.init({
                appId: "267591593342063",
                nativeInterface: CDV.FB,
                useCachedDialogs: false,
                xfbml: true // parse XFBML
            });
        } catch (e) {
            alert(e);
        }

        $scope.fbLogOut = function () {
            FB.logout(function (response) {
                $scope.$apply(function () {
                    $scope.fbResponse = null;
                })
            });
        }

        $scope.fbLogin = function () {
            $scope.signinLoader = true;
            FB.login(function (response) {
            var accesstoken = response.authResponse.accessToken;
            console.log('access token', accesstoken);

            $http.get('http://www.skatespots.com.au/getlogin.php?accesstoken=' + accesstoken, {
                cache: true
            });    
                if (response.authResponse) {

                    FB.api('/me', function (response) {
                        var userPage = "/app/user/" + response.id;
                        $scope.$apply(function () {
                            $scope.fbResponse = response;
                            $rootScope.fbResponse = response;
                            $scope.fbImage = 'http://graph.facebook.com/' + response.id + '/picture?width=55&height=55';
                            $scope.signinLoader = false;
                            $location.path(userPage);
                            $scope.noLogin = true;
                        })

                        $ionicSideMenuDelegate.toggleLeft();

                        return true;

                    });
                } else {
                    console.log('User cancelled login or did not fully authorize.');
                }
            }, {
                scope: 'email,user_likes'
            });
        }
    }


    $scope.clearSearch = function () {
        $('#search').val('');
        $scope.searchResults = null;
    }

    angular.element(document).ready(function () {

        $('#search').keyup(function () {
            if ($('#search').val().length >= 3) {
                $scope.searchLoading = true;
                var search = $('#search').val();
                searchFactory.getSpots(search, function (results) {
                    console.log(results);
                    $scope.searchLoading = false;
                    $scope.searchResults = results;
                    $scope.noResults = false;

                    if (results[0].error) {
                        $scope.noResults = true;
                    }

                });
            }
        });

    })

})



.factory('searchFactory', function ($http, $stateParams) {  
    return {
        getSpots: function (search, callback) {      
            $http.get('http://www.skatespots.com.au/getsearch.php?search=' + search, {
                cache: true
            }).success(callback);    
        }  
    };
})

.factory('fruitsFactory', function ($http, $stateParams) {  
    return {
        getSpots: function (currentState, callback) {
            var currentType = $stateParams.spotType;      
            $http.get('http://www.skatespots.com.au/parks_json.php?state=' + currentState + '&spottype=' + currentType, {
                cache: true
            }).success(callback);
        },
        allSpots: function (callback) {
            var currentType = $stateParams.spotType;      
            $http.get('http://www.skatespots.com.au/parks_json.php?spottype=' + currentType, {
                cache: true
            }).success(callback);
        }  
    };
})

.factory('nearbyAjax', function ($http, $stateParams) {  
    return {
        getSpots: function (userLat, userLong, callback) {
            var currentType = $stateParams.spotType;      
            $http.get('http://skatespots.com.au/getnearby.php?userLat=' + userLat + '&userLong=' + userLong + '&type=' + currentType, {
                cache: true
            }).success(callback);    
        }  
    };
})


.controller('SpotsCtrl', function ($scope, fruitsFactory, nearbyAjax, $ionicActionSheet, $stateParams, $rootScope, $ionicPopup, $ionicScrollDelegate) {
    $scope.loading = true;
    $scope.loadingMap = true;
    $scope.currentType = $stateParams.spotType;
    $scope.currentState = 'Select a state';

    if(ionic.Platform.isIOS()){
    document.addEventListener("deviceready", letsDoMap, false);
    } else {
        letsDoMap();
    }
    
    function letsDoMap() {
    // angular.element(document).ready(function () {
    if(!$rootScope.currentRefine || $rootScope.currentRefine == 'Nearby'){
        $rootScope.currentRefine = 'Nearby';
        navigator.geolocation.getCurrentPosition(setLocation, error);
        function setLocation(position) {
            userLat = position.coords.latitude;
            userLong = position.coords.longitude;
            $rootScope.userLat = userLat;
            $rootScope.userLong = userLong;
                nearbyAjax.getSpots(userLat, userLong, function (results) {
                    $scope.Spots = results;
                    $scope.loading = false;
                    $scope.loadedMessage = 'All ' + $scope.currentType + 's nearby loaded';                 
                });
        }
        function error(err) {

            $scope.geoDenied = true;

            $('.refine-state').addClass('active');
            $('.refine-nearby').removeClass('active');
            $rootScope.currentRefine = 'VIC';

            fruitsFactory.getSpots($rootScope.currentRefine, function (results) {
                $scope.Spots = results;
                $scope.loading = false;
                $scope.loadedMessage = 'All ' + $scope.currentType + 's in ' + $rootScope.currentRefine + ' loaded';
            });
        };
    } else {
        $('.refine-state').addClass('active');
        $('.refine-nearby').removeClass('active');
        $rootScope.currentRefine = currentState;

        fruitsFactory.getSpots($rootScope.currentRefine, function (results) {
            $scope.Spots = results;
            $scope.loading = false;
            $scope.loadedMessage = 'All ' + $scope.currentType + 's in ' + $rootScope.currentRefine + ' loaded';
        });
    }
    


    fruitsFactory.allSpots(function (results) {
      
        // var myLatlng = new google.maps.LatLng(results.lat,results.long);
        // var state = $rootScope.currentRefine;

        var currentRefine = $rootScope.currentRefine;
        
        if( currentRefine == 'Nearby' ){
          var mapZoom = 12;
      	  var mapCenter = new google.maps.LatLng($rootScope.userLat, $rootScope.userLong);
        } else {
            switch (currentRefine) {
                    case "VIC":
                        $scope.currentState = 'Victoria';
                        var mapZoom = 6;
                        var mapCenter = new google.maps.LatLng(-37, 145.5000);
                        break;
                    case "NSW":
                        $scope.currentState = 'New South Wales';
                        var mapZoom = 5;
                        var mapCenter = new google.maps.LatLng(-34.0000, 147.0000);
                        break;
                    case "QLD":
                        $scope.currentState = 'Queensland';
                        var mapZoom = 4;
                         var mapCenter = new google.maps.LatLng(-23.0000, 43.0000);
                        break;
                    case "SA":
                        $scope.currentState = 'South Australia';
                        var mapZoom = 4;
                        var mapCenter = new google.maps.LatLng(-32.0000, 135.0000);
                        break;
                    case "NT":
                        $scope.currentState = 'Northern Territory';
                        var mapZoom = 4;
                        var mapCenter = new google.maps.LatLng(-22.0000, 133.0000);
                        break;
                    case "ACT":
                        $scope.currentState = 'Australian Capital Territory';
                        var mapZoom = 10;
                        var mapCenter = new google.maps.LatLng(-35.3081, 149.1244);
                        break;
                    case "TAS":
                        $scope.currentState = 'Tasmania';
                        var mapZoom = 6;
                        var mapCenter = new google.maps.LatLng(-42.0000, 146.6000);
                        break;
                    case "WA":
                        $scope.currentState = 'Western Australia';
                        var mapZoom = 4;
                        var mapCenter = new google.maps.LatLng(-26.0000, 121.0000);
                        break;
                    }


            if($rootScope.userLat && $rootScope.userLong){

            userLat = $rootScope.userLat;
            userLong = $rootScope.userLong;

            var image = new google.maps.MarkerImage(
                'http://www.skatespots.com.au/wp-content/themes/skatespots/images/currentlocation.png',
                null, // size
                null, // origin
                new google.maps.Point(8, 8), // anchor (move to center of marker)
                new google.maps.Size(17, 17) // scaled size (required for Retina display icon)
            );

            // then create the new marker
            marker = new google.maps.Marker({
                flat: true,
                icon: image,
                map: map,
                optimized: false,
                position: userlatLng,
                title: "You Are Here",
                visible: true
            });

        }


        }

        
        var map = new google.maps.Map(document.getElementById('listMap'), {
            zoom: mapZoom,
            disableDefaultUI: true,
            panControl: false,
            scrollwheel: false,
            mapTypeControl: false,
            streetViewControl: false,
            center: mapCenter,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });


        if ($rootScope.userLat && $rootScope.userLong) {
            var userlatLng = new google.maps.LatLng($rootScope.userLat, $rootScope.userLong);

            var image = new google.maps.MarkerImage(
                'http://www.skatespots.com.au/wp-content/themes/skatespots/images/currentlocation.png',
                null, // size
                null, // origin
                new google.maps.Point(8, 8), // anchor (move to center of marker)
                new google.maps.Size(17, 17) // scaled size (required for Retina display icon)
            );

            // then create the new marker
            marker = new google.maps.Marker({
                flat: true,
                icon: image,
                map: map,
                optimized: false,
                position: userlatLng,
                title: "You Are Here",
                visible: true
            });
        }

        var ib;
        var markers = [];
        var marker, i;

        for (i = 0; i < results.length; i++) {
            var latLng = new google.maps.LatLng(results[i]['lat'], results[i]['long']);
            var marker = new google.maps.Marker({
                'position': latLng
            });
            markers.push(marker);


            google.maps.event.addListener(marker, 'click', (function (marker, i) {
                return function () {
                    map.setCenter(marker.getPosition());
                    $scope.$apply(function () {
                        $scope.mapPreview = results[i];
                    })
                }
            })(marker, i));
        }

        $('.map-list').click(function () {
            $scope.$apply(function () {
                $scope.mapPreview = null;
            })
            $('.map-preview').removeClass('full-map');
            $('.map-list').hide();
            $('#listMap').removeClass('full-map');
            setTimeout(function () {
                google.maps.event.trigger(map, "resize");
            }, 400);
            $('.map-large').show();
        });

        $('.map-large').click(function () {

            $scope.$apply(function () {
                $scope.mapPreview = null;
            })

            $('#listMap').addClass('full-map');
            $('.map-preview').addClass('full-map');
            $('.map-large').hide();
            $('.map-list').show();
            setTimeout(function () {
                google.maps.event.trigger(map, "resize");
            }, 400);

        });

        google.maps.event.addListener(map, 'dragstart', function () {
            $scope.$apply(function () {
                $scope.mapPreview = null;
            })
        });


        google.maps.event.addListener(map, 'zoom_changed', function () {
            $scope.$apply(function () {
                $scope.mapPreview = null;
            })
        });



        $scope.getNearby = function () {
            $scope.loading = true;

            $scope.$apply(function () {
                $scope.mapPreview = null;
            })

            $('.refine-state').removeClass('active');
            $('.refine-nearby').addClass('active');

            if ($rootScope.userLat && $rootScope.userLong) {
                map.setZoom(12);
                map.panTo(new google.maps.LatLng($rootScope.userLat, $rootScope.userLong));
                nearbyAjax.getSpots($rootScope.userLat, $rootScope.userLong, function (results) {
                    $scope.Spots = results;
                    $scope.loading = false; 
                });
            } else {

                if($scope.geoDenied){
                    $('.refine-state').addClass('active');
                    $('.refine-nearby').removeClass('active');
                    $scope.loading = false; 
                     $ionicPopup.alert({
                        content: 'You have denied this app access to your location, please reset your safari settings and try again'
                    })
                }

                navigator.geolocation.getCurrentPosition(showPosition);

                function showPosition(position) {
                    userLat = position.coords.latitude;
                    userLong = position.coords.longitude;
                    $rootScope.userLat = userLat;
                    $rootScope.userLong = userLong;
                    nearbyAjax.getSpots(userLat, userLong, function (results) {
                        $scope.Spots = results;
                        $scope.loading = false; 
                    });

                }
            }
            $rootScope.currentRefine = 'Nearby';
            $rootScope.loadedMessage = 'All ' + $scope.currentType + 's nearby loaded';
        }



        $scope.selectState = function () {

            $ionicActionSheet.show({
                titleText: 'Select a state',
                buttons: [{
                    text: 'Victoria'
                }, {
                    text: 'New South Wales'
                }, {
                    text: 'Queensland'
                }, {
                    text: 'South Australia'
                }, {
                    text: 'Northern Territory'
                }, {
                    text: 'Australian Capital Territory'
                }, {
                    text: 'Tasmania'
                }, {
                    text: 'Western Australia'
                }],
                cancelText: 'Cancel',
                cancel: function () {
                    console.log('CANCELLED');
                },
                buttonClicked: function (index) {
                    $scope.Spots = null;
                    $scope.loading = true;
                    $scope.mapPreview = null;

                    $('.refine-state').addClass('active');
                    $('.refine-nearby').removeClass('active');

                    switch (index) {
                    case 0:
                        $scope.currentState = 'Victoria';
                        currentState = 'VIC';
                        map.setZoom(6);
                        map.panTo(new google.maps.LatLng(-37, 145.5000));
                        break;
                    case 1:
                        $scope.currentState = 'New South Wales';
                        currentState = 'NSW';
                        map.setZoom(5);
                        map.panTo(new google.maps.LatLng(-34.0000, 147.0000));
                        break;
                    case 2:
                        $scope.currentState = 'Queensland';
                        currentState = 'QLD';
                        map.setZoom(4);
                        map.panTo(new google.maps.LatLng(-23.0000, 143.0000));
                        break;
                    case 3:
                        $scope.currentState = 'South Australia';
                        currentState = 'SA';
                        map.setZoom(4);
                        map.panTo(new google.maps.LatLng(-32.0000, 135.0000));
                        break;
                    case 4:
                        $scope.currentState = 'Northern Territory';
                        currentState = 'NT';
                        map.setZoom(4);
                        map.panTo(new google.maps.LatLng(-22.0000, 133.0000));
                        break;
                    case 5:
                        $scope.currentState = 'Australian Capital Territory';
                        currentState = 'ACT';
                        map.setZoom(10);
                        map.panTo(new google.maps.LatLng(-35.3081, 149.1244));
                        break;
                    case 6:
                        $scope.currentState = 'Tasmania';
                        currentState = 'TAS';
                        map.setZoom(6);
                        map.panTo(new google.maps.LatLng(-42.0000, 146.6000));
                        break;
                    case 7:
                        $scope.currentState = 'Western Australia';
                        currentState = 'WA';
                        map.setZoom(4);
                        map.panTo(new google.maps.LatLng(-26.0000, 121.0000));
                        break;
                    }


                    $ionicScrollDelegate.scrollTop();


                    fruitsFactory.getSpots(currentState, function (results) {

                        $rootScope.currentRefine = currentState;
                        $scope.Spots = results;
                        $scope.loading = false;
                        $scope.loadedMessage = 'All ' + $scope.currentType + 's in ' + $rootScope.currentRefine + ' loaded';
                    });

                    return true;
                }
            });
        };


        var isLoad = false;

        google.maps.event.addListener(map, 'tilesloaded', function () {

            $scope.$apply(function () {
                $scope.loadingMap = false;
            });


            if (!isLoad) {
                isLoad = true;

                var markerCluster = new MarkerClusterer(map, markers, {
                    gridSize: 30,
                    styles: [{
                        textColor: "black",
                        height: 33,
                        url: "http://www.skatespots.com.au/wp-content/themes/skatespots/images/cluster_icon.png",
                        width: 38,
                        textSize: 14
                    }]

                });
            }
        });


        $scope.map = map;
    });
}
})

.factory('parksFactory', function ($http) {  
    return {
        getParks: function (callback) {      
            $http.get('http://www.skatespots.com.au/parks_json.php?spottype=park&state=VIC').success(callback);    
        }  
    };
})


.controller('parksCtrl', function ($scope, parksFactory) {
    parksFactory.getParks(function (results) {
        $scope.Spots = results;
    });
})

.factory('favouriteFactory', function ($http, $stateParams) {  
    return {
        getSpots: function (fbid, callback) {
            $http.get('http://www.skatespots.com.au/getfavourites.php?userid=' + fbid).success(callback);
        },
        addFavourite: function (fbid, favourite, callback) {
            $http.get('http://www.skatespots.com.au/getfavourites.php?userid=' + fbid + '&favourite=' + favourite).success(callback);
        }  
    };
})

.controller('favouritesCtrl', function ($scope, $rootScope, favouriteFactory) {
    var fbid = $rootScope.fbResponse.id;
    $scope.loading = true;
    if (fbid) {
        favouriteFactory.getSpots(fbid, function (results) {
            $scope.favourites = results;
            $scope.loading = false;
        });
    }
})

.factory('topFactory', function ($http) {  
    return {
        getParks: function (callback) {      
            $http.get('http://skatespots.com.au/gettop.php').success(callback);    
        }  
    };
})

.controller('topCtrl', function ($scope, topFactory, $ionicScrollDelegate) {
    $scope.loading = true;
    topFactory.getParks(function (results) {
        $scope.loading = false;
        $scope.Spots = results.spots;
        $scope.Parks = results.parks;
        $scope.showSpots = true;
        $scope.toggleParks = function () {
            $ionicScrollDelegate.scrollTop();
            $scope.showSpots = false;
        }
        $scope.toggleSpots = function () {
            $ionicScrollDelegate.scrollTop();
            $scope.showSpots = true;
        }
    });
})

.controller('addCtrl', function ($scope, $stateParams, $location, $ionicPopup, $ionicScrollDelegate) {
    $scope.addType = $stateParams.addType;
    $scope.typeId = 12;
    $scope.uploading = false;
    $scope.uploadingMsg = '<i class="icon ion-loading-c"></i> submitting';
    $scope.inputCount = 1;

    $scope.showAlert = function () {
        $ionicPopup.alert({
            content: 'To change the ' + $stateParams.addType + ' location, click a point on the map or drag the marker to the location'
        })
    };

    $scope.addNewfile = function () {
        inputCount = $('.files input').length + 1;
        fileName = 'file_' + inputCount;
        $('.files').append('<input type="file" onchange="angular.element(this).scope().renderImage(this.files)" ng-click="addNewfile()" id="' + fileName + '" name="' + fileName + '" accept="image/*" class="required file">');
        setTimeout(function() {
            $('#' + fileName).trigger('click');
        }, 0);
    };

    $scope.renderImage = function (file) {
        file = file[0];
        var spanCount = $('.files input').length;
        var spanClass = 'new_row' + spanCount;

        var dropbox = $('#files_list'),
            message = $('.message', dropbox);

        $('input[name="file_' + spanCount + '"]').addClass(spanClass);

        var template = '<div class="template">' +
            '<span class="imageHolder">' +
            '<img />' +
            '<span></span>' +
            '</span><span class="delete_container"><div class="remove_image" type="button" value="Delete" data-inputclass="' + spanClass + '"><i class="ion-close-circled"></i></div></span>' +
            '</div>';

        var preview = $(template),
            image = $('img', preview);

        var reader;

        reader = new FileReader();

        reader.onload = function (e) {

            // e.target.result holds the DataURL which
            // can be used as a source of the image:

            image.attr('src', e.target.result);
            image.attr('width', '100');
        };

        // Reading the file as a DataURL. When finished,
        // this will trigger the onload function above:
        reader.readAsDataURL(file);

        message.hide();
        preview.appendTo('.files .preview');
        //$('.' + spanClass).append(file.name);

        // Associating a preview container
        // with the file, using jQuery's $.data():
        $.data(file, preview);

        spanCount++

        $('.remove_image').click(function () {
            currentTarget = $(this).attr("data-inputclass");

            $(this).parent().parent('div').remove();
            $('input.' + currentTarget).remove();
        });

    }

    if ($stateParams.addType == 'park') {
        $scope.typeId = 13;
    }

    $scope.submitForm = function () {


        // bind to the form's submit event 
        // inside event callbacks 'this' is the DOM element so we first 
        // wrap it in a jQuery object and then invoke ajaxSubmit 

        var failed = false;
        var oneChecked = false;
        var oneFile = false;


        if ($('#post_title').val() == '') {
            $('.name-error').show();
            failed = true;
        }

        if ($('#post_content').val() == '') {
            $('.descrip-error').show();
            failed = true;
        }

        if ($('.display-address').html() == "Stuart Hwy Manguri SA") {
            $('.location-error').show();
            failed = true;
        }


        $('.files input').each(function () {
            if ($(this).val()) {
                oneFile = true;
                return false;
            }
        });

        $('.list input').each(function () {

            var currentCheckbox = $(this);

            if (oneChecked == false) {

                if ($(currentCheckbox).attr('checked')) {
                    oneChecked = true;
                } else {
                    console.log('unchecked');
                }

            }

        });

        if (oneChecked == false) {
            $('.obstacle-error').show();
            failed = true;
        } else {
            $('.obstacle-error').hide();
        }

        if (oneFile == false) {
            $('.photos-error').show();
            failed = true;
        } else {
            $('.photos-error').hide();
        }


        if (failed == true) {

            var theError = $(".error:visible:first");

            $ionicPopup.alert({
                title: 'Not all fields are filled out',
                content: 'check the form and submit again'
            });

            $ionicScrollDelegate.scrollTop();

        } else {
            $('#form').submit();
        }

        // !!! Important !!! 
        // always return false to prevent standard browser submit and page navigation 
        return false;

    };

    angular.element(document).ready(function () {

        $('#form').submit(function (e) {
            e.preventDefault;
            var submitOptions = {
                beforeSubmit: showRequest, // pre-submit callback 
                success: showResponse // post-submit callback 
            };

            // pre-submit callback 
            function showRequest(formData, jqForm, options) {
                // $ionicPopup.alert({
                //     title: 'Cheers!',
                //     content: $scope.uploadingMsg
                // });
                $scope.uploading = true;
                return true;
            }

            // post-submit callback 
            function showResponse(responseText, statusText, xhr, $form, $locations) {
                var newSpot = "/app/playlists/" + responseText;
                $scope.$apply(function () {
                    $location.path(newSpot);
                })
            }


            $(this).ajaxSubmit(submitOptions);
            return false;
        });

        $('#post_title').change(function () {
            $('.name-error').hide();
        });

        $('#post_content').change(function () {
            $('.descrip-error').hide();
        });

        $('.files').change(function () {
            $('.photos-error').hide();
        });

        $('.list').change(function () {
            $('.obstacle-error').hide();
        });

        var mapOptions = {
            zoom: 3,
            center: new google.maps.LatLng(-28.500000, 134.472656),
            featureType: "poi",
            elementType: "labels",
            stylers: [{
                visibility: "off"
            }],
            disableDefaultUI: true,
            panControl: false,
            scrollwheel: false,
            mapTypeControl: false,
            streetViewControl: false
        };

        map = new google.maps.Map(document.getElementById('addMap'),
            mapOptions);
        var myLatlng = new google.maps.LatLng(-28.500000, 134.472656);
        makeAddress(-28.500000, 134.472656);
        var marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            draggable: true,
            animation: google.maps.Animation.DROP,
        });


        google.maps.event.addListener(marker, 'dragend', function (event) {
            var newLat = this.getPosition().lat();
            var newLong = this.getPosition().lng();
            makeAddress(newLat, newLong);
        });

        google.maps.event.addListener(map, 'click', function (event) {
            var currentLatLong = event.latLng;
            console.log("all dat", currentLatLong);
            marker.setPosition(currentLatLong);
            makeAddress(currentLatLong.k, currentLatLong.A);
        });

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition);
            console.log('im in here');
        } else {
            console.log("Geolocation is not supported by this browser.");
            var position = [];
            position['coords']['latitude'] = -28.500000;
            position['coords']['longitude'] = 134.472656;
            showPosition(position);
        }

        function showPosition(position) {
            var myLatlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            map.setCenter(myLatlng);
            map.setZoom(16);
            makeAddress(position.coords.latitude, position.coords.longitude);
            marker.setPosition(myLatlng);
        }

        function makeAddress(lat, long) {
            var geocoder = new google.maps.Geocoder();
            var latlng = new google.maps.LatLng(lat, long);
            geocoder.geocode({
                'latLng': latlng
            }, function (data, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var add = data[0].formatted_address; //this is the full address
                    var street = data[0].address_components[0].short_name + " " + data[0].address_components[1].short_name;
                    var sub = data[0].address_components[2].short_name;
                    var state = data[0].address_components[3].long_name;

                    console.log('The Address Array', data[0]);

                    $('input#input-address').val(street);
                    $('input#input-sub').val(sub);
                    $('input#input-state').val(state);
                    $('input#input-combo').val(add);
                    $('input#input-lat').val(lat);
                    $('input#input-long').val(long);
                    $('.display-address').html(street + " " + sub);
                }
            })
        }

        $scope.map = map;

    })


})

.factory('spotContentFactory', function ($http, $stateParams) {  
    return {
        getParks: function (callback) {      
            $http.get('http://skatespots.com.au/getpage.php?pageid=' + $stateParams.playlistId, {
                cache: true
            }).success(callback);    
        }  
    };
})

.controller('PlaylistCtrl', function ($scope, spotContentFactory, favouriteFactory, $stateParams, $ionicActionSheet, $ionicSlideBoxDelegate, $ionicScrollDelegate, $ionicPopup, $rootScope) {

    $scope.loading = true;
    $scope.showBody = false;

    spotContentFactory.getParks(function (results) {
        $scope.spotsContent = results;
        $scope.spotImages = results.images;
        $scope.nearby = results.nearby;
        $scope.nearbySibling = results.nearbySibling;
        $scope.ratingRound = results.ratingRound;
        $scope.facebook = results.fb;
        $scope.showBody = true;
        $scope.loading = false;
        $scope.url = results.url;
        $scope.slug = results.title.replace(/\s+/g, '-').toLowerCase();
        $scope.mapName = 'map-' + $scope.slug;
        $scope.address = results.address + ', ' + results.suburb + ', ' + results.state;
        $scope.directionsUrl = 'http://maps.apple.com/?daddr=' + results.addressFull;

        if (results.type == "park") {
            $scope.sibling = 'spot';
        } else {
            $scope.sibling = 'park';
        }

        console.log(results);

        if (results.fb) {
            $scope.fbImage = 'http://graph.facebook.com/' + results.fb.fbID + '/picture?width=40&height=40';
        }

        // $(".slider").prependTo(".spots-view").addClass('moved');
        // $(".slider-pager").before($(".img-select"));

        $ionicSlideBoxDelegate.update();


        angular.element(window).ready(function () {

            $('.spot-description a').click(function(e){
                e.preventDefault;
                window.open(this.href,'_system');
                return false;
            });

            $scope.addImage = function () {
            setTimeout(function() {
                $('#async-upload').trigger('click');
            }, 0);
            return false;
            }

            $('#async-upload').change(function () {
                console.log('changed');
                $('#addPhoto').submit();
                console.log('submited');
                $scope.$apply(function () {
                    $scope.uploading = true;
                })
            });

            $('#addPhoto').ajaxForm(function () {
                $scope.$apply(function () {
                    $scope.uploading = false;
                })
            });

            var mapOptions = {
                center: new google.maps.LatLng(results.lat, results.long),
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                scrollwheel: false,
                zoom: 14,
                disableDefaultUI: true,
                streetViewControl: false,
                mapTypeControl: false,
                draggable: false
            };
            var myLatlng = new google.maps.LatLng(results.lat, results.long);
            var map = new google.maps.Map(document.getElementById($scope.mapName),
                mapOptions);

            var marker = new google.maps.Marker({
                position: myLatlng,
                map: map,
                title: results.address
            });

            var infowindow = new google.maps.InfoWindow({
                content: results.addressFull,
                maxWidth: 125
            });

            $scope.map = map;

        })

        $scope.showComments = function () {
            // if($rootScope.fbResponse){
            // $('#comments .btn_gold').hide();
            $ionicScrollDelegate.scrollBottom();
            $scope.loadingComments = true;
            FB.XFBML.parse(document.getElementById('comments'), function () {
                $scope.$apply(function () {
                    $scope.loadingComments = false;
                    $('#comments iframe').show();
                    $scope.$broadcast('scroll.resize');
                });
            });
            // }
        }


        $scope.openURL = function (urlString) {
            myURL = encodeURI(urlString);
            window.open(myURL, '_system');
        }

        $scope.addToFavourites = function () {
            var favouriteName = $scope.spotsContent.title;
            var favouriteID = $scope.spotsContent.id;
            if ($rootScope.fbResponse) {
                var fbid = $rootScope.fbResponse.id;
            }
            if (fbid) {
                $ionicPopup.alert({
                    title: favouriteName,
                    content: 'has been added to your favourites'
                });

                favouriteFactory.addFavourite(fbid, favouriteID, function (results) {
                    $scope.favourites = results;
                    $scope.loading = false;
                });
            } else {
                $ionicPopup.alert({
                    content: 'Sign in to add this ' + $scope.spotsContent.type + ' to your favourites'
                });
            }
        }

        $scope.copyAddress = function () {
            var copyAddress = $scope.address;
            cordova.plugins.clipboard.copy(copyAddress);
            $ionicPopup.alert({
                content: 'The address has been copied to your clipboard'
            })
        }

        $scope.showActionsheet = function () {

            $ionicActionSheet.show({
                // titleText: 'ActionSheet Example',
                buttons: [{
                        text: 'SMS link'
                    }, {
                        text: 'Copy link'
                    }, {
                        text: 'SMS Address'
                    }, {
                        text: 'Copy Address'
                    },

                ],
                cancelText: 'Cancel',
                cancel: function () {
                    console.log('CANCELLED');
                },
                buttonClicked: function (index) {
                    var copyUrl = $scope.url;
                    var copyAddress = $scope.address;
                    switch (index) {
                    case 0:
                        window.plugins.socialsharing.share(null, null, null, copyUrl);
                        break;
                    case 1:
                        cordova.plugins.clipboard.copy(copyUrl);
                        break;
                    case 2:
                        window.plugins.socialsharing.share(copyAddress, null, null, null);
                        break;
                    case 3:
                        cordova.plugins.clipboard.copy(copyAddress);
                        break;
                    }
                    return true;
                }
            });
        }; 
    });
})


.factory('userFactory', function ($http, $stateParams) {  
    return {
        getUser: function (callback) {      
            $http.get('http://skatespots.com.au/getuser.php?userid=' + $stateParams.userId, {
                cache: true
            }).success(callback);    
        }  
    };
})


.controller('userCtrl', function ($scope, userFactory, $stateParams) {

    $scope.loading = true;

    userFactory.getUser(function (results) {
        console.log(results);
        $scope.loading = false;
        $scope.name = results.user;
        $scope.id = results.id;
        $scope.userImage = 'http://graph.facebook.com/' + results.id + '/picture?width=100&height=100'
        $scope.state = results.state;
        $scope.website = results.website;
        $scope.bio = results.bio;
        $scope.Spots = results.spots;
        $scope.Parks = results.parks;


        if(results.parks == undefined && results.spots == undefined){
            $scope.noListings = true;
        }


        $scope.toggleSpots = function () {
            $scope.showSpots = true;
            $scope.showParks = false;
        }

        $scope.toggleParks = function () {
            $scope.showParks = true;
            $scope.showSpots = false;
        }

        if (results.spots) {
            $scope.showSpots = true;
        } else if (results.parks) {
            $scope.showParks = true;

        }

        angular.element(document).ready(function () {
                var mapOptions = {
                center: new google.maps.LatLng(-37.8136, 144.9631),
                zoom: 14,
                disableDefaultUI: true,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                streetViewControl: false
                };
            var map = new google.maps.Map(document.getElementById("usermap"),
                mapOptions);

            var marker, i;
            var LatLngList = []
            var markers = [];
            var markerCount = 0;

            if (results.spots) {
                for (i = 0; i < results.spots.length; i++) {
                    var latLng = new google.maps.LatLng(results.spots[i]['latitude'], results.spots[i]['longitude']),
                        marker = new google.maps.Marker({
                            position: latLng,
                            map: map
                        });

                    LatLngList[markerCount] = latLng,
                    markers.push(marker);
                    markerCount++;


                    google.maps.event.addListener(marker, 'click', (function (marker, i) {
                        return function () {
                            map.setCenter(marker.getPosition());
                            $scope.$apply(function () {
                                $scope.mapPreview = results.spots[i];
                            })
                        }
                    })(marker, i));
                }
            }

            if (results.parks) {
                for (i = 0; i < results.parks.length; i++) {
                    var latLng = new google.maps.LatLng(results.parks[i]['latitude'], results.parks[i]['longitude']),
                        marker = new google.maps.Marker({
                            position: latLng,
                            map: map
                        });

                    markers.push(marker);
                    LatLngList[markerCount] = latLng,
                    markerCount++;

                    google.maps.event.addListener(marker, 'click', (function (marker, i) {
                        return function () {
                            map.panTo(marker.getPosition());
                            $scope.$apply(function () {
                                $scope.mapPreview = results.parks[i];
                            })
                        }
                    })(marker, i));
                }
            }

            google.maps.event.addListener(map, 'dragstart', function () {
                $scope.$apply(function () {
                    $scope.mapPreview = null;
                })
            });


            google.maps.event.addListener(map, 'zoom_changed', function () {
                $scope.$apply(function () {
                    $scope.mapPreview = null;
                })
            });

            if(results.parks != undefined && results.spots != undefined){
                var bounds = new google.maps.LatLngBounds();
                for (var i = 0, LtLgLen = LatLngList.length; i < LtLgLen; i++) {
                    bounds.extend(LatLngList[i]);
                }
                map.fitBounds(bounds);
            }

            var isLoad = false;
            google.maps.event.addListener(map, 'tilesloaded', function () {
                if (!isLoad) {
                    isLoad = true;

                    var markerCluster = new MarkerClusterer(map, markers, {
                        styles: [{
                            textColor: "black",
                            height: 33,
                            url: "http://www.skatespots.com.au/wp-content/themes/skatespots/images/cluster_icon.png",
                            width: 38,
                            textSize: 14
                        }]

                    });
                }

            });
            $scope.map = map;
        })


    });
})