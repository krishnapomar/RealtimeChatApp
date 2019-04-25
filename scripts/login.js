var myApp = angular.module("AskApp", ['ngRoute', 'firebase']);

// Initialize Firebase
var config = {
    apiKey: "AIzaSyCvDZ3eiYahjMyLo_LsBYVz1PcdzWxZyw0",
    authDomain: "askk-me.firebaseapp.com",
    databaseURL: "https://askk-me.firebaseio.com",
    projectId: "askk-me",
    storageBucket: "",
    messagingSenderId: "375849091041"
};

firebase.initializeApp(config);

myApp.config(function ($routeProvider) {
    $routeProvider
        .when('/Home', {
            templateUrl: 'pages/Home.html',
            controller: 'homeController'
        })

        // route for the Domain page
        .when('/Domain', {
            templateUrl: 'pages/Domain.html',
            controller: 'homeController'
        })

        // route for the Asked page
        .when('/Asked', {
            templateUrl: 'pages/Asked.html',
            //controller: 'homecontroller'
        })

        // route for the Asked page
        .when('/Answered', {
            templateUrl: 'pages/Answered.html',
            //controller: 'homecontroller'
        })

        // route for the Asked page
        .when('/DomainDetails', {
            templateUrl: 'pages/DomainDetails.html',
            controller: 'domainController'
        })
});

myApp.config(['$locationProvider', function ($locationProvider) {
    $locationProvider.hashPrefix('');
}]);

angular.module('LoginApp')
    .config(function ($httpProvider, $httpParamSerializerJQLikeProvider) {
        $httpProvider.defaults.transformRequest.unshift($httpParamSerializerJQLikeProvider.$get());
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8';

        setTimeout(function () {
            askedQuestions.innerHTML = 123455;
        }, 1000);

        setTimeout(function () {
            answeredQuestions.innerHTML = 23409;
        }, 1000);
});

myApp.controller("loginController", function ($scope, $window) {
    console.log("Inside login controller");
    $scope.onSignIn = function () {   
        var token = sessionStorage.getItem("googleToken");
        if (!token) {
            googleSignIn($window);
        }
        else {
            $window.location.href = "#/Home";
        }
    };
});

myApp.factory('selectedDomain', function () {
    var domainName;
    var addDomainName = function (d) { domainName = d; }

    return {
        setDomainName: function (d) {
            addDomainName(d);
        },
        getDomainName: function () {
            return domainName;
        }
    };
});

myApp.controller("homeController", function ($scope, $window, selectedDomain) {
    console.log("Inside homeController controller");

    $scope.domainNames = ["Arts", "Automobiles", "Educational", "Electrical Appliances", "Entertainment",
        "Fashion", "Food", "Health", "Information Tech", "Photograhpy", "Smart Devices", "Sports", "Others"];

    $scope.domainBtnclick = function (item) {
        selectedDomain.setDomainName(item);
        $window.location.href = "#/DomainDetails";
    };
});

myApp.controller("domainController", function ($scope, $firebaseObject, selectedDomain) {
    console.log("Inside Domain controller");
    $scope.selectedDomain = selectedDomain.getDomainName();

    var dbRef = firebase.database().ref().child('DomainNames').child($scope.selectedDomain);
    $scope.questions = $firebaseObject(dbRef);
    $scope.selectQuestion = function (q) {

    };

    $scope.askQuestion = function () {
        var questionAsked = window.prompt("Ask", "");
        if (questionAsked) {
            var user = sessionStorage.getItem("user");
            var profile = sessionStorage.getItem("profile");
            if (!user) {
                user = "Anonymous";
                profile = "none";
            }
            var newQuestion = {
                chatBy: user,
                chatMsg: questionAsked,
                chatProfilePic: profile,
                chatTime: new Date().toLocaleDateString()
            }
            dbRef.push(newQuestion);
        }
    };
});

async function googleSignIn($window) {
    var provider = new firebase.auth.GoogleAuthProvider();
    await firebase.auth().signInWithPopup(provider).then(function (result) {
        var token = result.credential.accessToken;
        sessionStorage.setItem("googleToken", token);
        sessionStorage.setItem("user", result.user.displayName);
        sessionStorage.setItem("profile", result.user.photoURL);
    }).catch(function (error) {
        var errorMessage = error.message;
        console.log(errorMessage);
        });
    $window.location.href = "#/Home";
}