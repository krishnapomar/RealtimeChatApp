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
        .when('/', {
            templateUrl: 'pages/Login.html',
            controller: 'loginController'
        })

        .when('/Home', {
            templateUrl: 'pages/Home.html',
            controller: 'homeController'
        })

        .when('/Login', {
            templateUrl: 'pages/Login.html',
            controller: 'loginController'
        })

        .when('/DomainDetails/:domainName', {
            templateUrl: 'pages/DomainDetails.html',
            controller: 'domainController'
        })

        .when('/QuestionDetails/:domainName/:questionKey', {
            templateUrl: 'pages/QuestionDetails.html',
            controller: 'questionController'
        })

        .when('/Asked', {
            templateUrl: 'pages/Asked.html',
            controller: 'askedController'
        })

        .when('/Answered', {
            templateUrl: 'pages/Answered.html',
            controller: 'answeredController'
        })

        //.otherwise({
        //    templateUrl: 'Index.html',
        //    controller: 'loginController'
        //});
});

myApp.config(['$locationProvider', function ($locationProvider) {
    $locationProvider.hashPrefix('');
}]);

angular.module('AskApp')
    .config(function ($httpProvider, $httpParamSerializerJQLikeProvider) {
        $httpProvider.defaults.transformRequest.unshift($httpParamSerializerJQLikeProvider.$get());
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8';
    });

myApp.controller("homeController", function ($scope, $window) {
    console.log("Inside homeController controller");

    var profilePic = sessionStorage.getItem("profilePic");

    $("#userProfilePic").attr("src", profilePic);
    
    //askUserPermission();

    $('body').css('background-image', 'none');
    $('#introDetails').css('display', 'none');

    //$scope.domainNames = ["Arts", "Automobiles", "Educational", "Electrical Appliances", "Entertainment",
    //    "Fashion", "Food", "Health", "Information Tech", "Photograhpy", "Smart Devices", "Sports", "Others"];

    pbAnimate();

    $scope.domainBtnclick = function (item) {
        $window.location.href = "#/DomainDetails/"+item;
    };
});

myApp.controller("domainController", function ($scope, $routeParams, $firebaseArray, $window) {
    console.log("Inside Domain controller");

    var profilePic = sessionStorage.getItem("profilePic");
    $("#userProfilePic").attr("src", profilePic);

    var domainName = $routeParams.domainName;
    $('#spinner').show();
    $('body').css('background-color', 'lightgray');

    $scope.selectedDomain = domainName;
    var dbRef = firebase.database().ref().child('DomainNames').child(domainName);
    $scope.questions = $firebaseArray(dbRef);
    
    $scope.questions.$loaded().finally(function () {
        $('#spinner').hide();
        $('body').css('background-color', 'white');
    });
    
    $scope.selectQuestion = function (q) {
        var questionId = q.$id.replace('-', '');
        //sessionStorage.setItem("question", q.chatMsg);
        //sessionStorage.setItem("postedBy", q.chatBy);
        //sessionStorage.setItem("postedTime", q.chatTime);
        $window.location.href = "#/QuestionDetails/" + domainName + "/" + questionId;
    };

    $scope.askQuestion = function () {
        var user = sessionStorage.getItem("user");
        var profile = sessionStorage.getItem("profilePic");
        var email = sessionStorage.getItem("email");
        if (user) {
            var questionAsked = window.prompt("Ask", "");
            if (questionAsked) {
                dbRef.push({
                    chatBy: user,
                    chatMsg: questionAsked,
                    chatProfilePic: profile,
                    chatTime: new Date().toLocaleDateString(),
                    chatEmail: email
                });
            }
        }
        else {
            $window.location.href = "#/Login";
        }
    };
});

myApp.controller("questionController", function ($scope, $routeParams, $firebaseObject, $window) {
    console.log("Inside questionController controller");

    var profilePic = sessionStorage.getItem("profilePic");
    $('#domainAnswerHeader').hide();
    $("#userProfilePic").attr("src", profilePic);
    $('#spinner').show();
    $('body').css('background-color', 'lightgray');

    var dbQuestionRef = firebase.database().ref().child('DomainNames').child($routeParams.domainName).child('-' + $routeParams.questionKey);
    $scope.questionDetails = $firebaseObject(dbQuestionRef);
    console.log($scope.questionDetails);

    var dbCommentsRef = firebase.database().ref().child('DomainNames').child($routeParams.domainName).child('-' + $routeParams.questionKey).child('comments');
    $scope.answers = $firebaseObject(dbCommentsRef);

    $scope.answers.$loaded().finally(function () {
        $('#spinner').hide();
        $('#domainAnswerHeader').show();
        $('body').css('background-color', 'white');
    });

    $scope.answerBtn = function () {
        var user = sessionStorage.getItem("user");
        var profilePic = sessionStorage.getItem("profilePic");
        var emailID = sessionStorage.getItem("email");
        
        if (user) {
            var questionAnswered = window.prompt("Answer", "");
            if (questionAnswered) {
                dbCommentsRef.push({
                    comment: questionAnswered,
                    commentBy: user,
                    commentEmail: emailID,
                    commentProfile: profilePic,
                    commentTime: new Date().toLocaleDateString()
                });
            }
        }
        else {
            $window.location.href = "#/Login";
        }
    };
});

myApp.controller("askedController", function ($scope, $window) {
    console.log("Inside askedController controller");

    $scope.loggedUserProfilePic = sessionStorage.getItem("profilePic");
});

myApp.controller("answeredController", function ($scope, $window) {
    console.log("Inside answeredController controller");

    $scope.loggedUserProfilePic = sessionStorage.getItem("profilePic");
});

myApp.controller("loginController", function ($scope, $window) {
    console.log("Inside login controller");
    
    setTimeout(function () {
        askedQuestions.innerHTML = 124;
    }, 1000);

    setTimeout(function () {
        answeredQuestions.innerHTML = 23;
    }, 1000);

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

async function googleSignIn($window) {
    var provider = new firebase.auth.GoogleAuthProvider();
    await firebase.auth().signInWithPopup(provider).then(function (result) {
        sessionStorage.setItem("googleToken", result.credential.accessToken);
        sessionStorage.setItem("user", result.user.displayName);
        sessionStorage.setItem("profilePic", result.user.photoURL);
        sessionStorage.setItem("email", result.user.email);
        $window.location.href = "#/Home";
    }).catch(function (error) {
        var errorMessage = error.message;
        console.log(errorMessage);
    });
}

function pbAnimate() {
    $('.pbArts').animate(
        { width: '100%' },
        {
            duration: 2000,
            step: function (now, fx) {
                var data = Math.round(now);
                $(this).html(data + '%');

            }
        }
    );

    $('.pbAutomobiles').animate(
        { width: '44%' },
        {
            duration: 2000,
            step: function (now, fx) {
                var data = Math.round(now);
                $(this).html(data + '%');

            }
        }
    );

    $('.pbEducation').animate(
        { width: '15%' },
        {
            duration: 2000,
            step: function (now, fx) {
                var data = Math.round(now);
                $(this).html(data + '%');

            }
        }
    );

    $('.pbAppliances').animate(
        { width: '80%' },
        {
            duration: 2000,
            step: function (now, fx) {
                var data = Math.round(now);
                $(this).html(data + '%');

            }
        }
    );

    $('.pbEntertainment').animate(
        { width: '44%' },
        {
            duration: 2000,
            step: function (now, fx) {
                var data = Math.round(now);
                $(this).html(data + '%');

            }
        }
    );

    $('.pbFashion').animate(
        { width: '23%' },
        {
            duration: 2000,
            step: function (now, fx) {
                var data = Math.round(now);
                $(this).html(data + '%');

            }
        }
    );

    $('.pbFood').animate(
        { width: '55%' },
        {
            duration: 2000,
            step: function (now, fx) {
                var data = Math.round(now);
                $(this).html(data + '%');

            }
        }
    );

    $('.pbHealth').animate(
        { width: '40%' },
        {
            duration: 2000,
            step: function (now, fx) {
                var data = Math.round(now);
                $(this).html(data + '%');

            }
        }
    );

    $('.pbInfoTech').animate(
        { width: '20%' },
        {
            duration: 2000,
            step: function (now, fx) {
                var data = Math.round(now);
                $(this).html(data + '%');

            }
        }
    );

    $('.pbOthers').animate(
        { width: '50%' },
        {
            duration: 2000,
            step: function (now, fx) {
                var data = Math.round(now);
                $(this).html(data + '%');

            }
        }
    );

    $('.pbPhoto').animate(
        { width: '50%' },
        {
            duration: 2000,
            step: function (now, fx) {
                var data = Math.round(now);
                $(this).html(data + '%');

            }
        }
    );

    $('.pbSDevices').animate(
        { width: '50%' },
        {
            duration: 2000,
            step: function (now, fx) {
                var data = Math.round(now);
                $(this).html(data + '%');

            }
        }
    );

    $('.pbSports').animate(
        { width: '50%' },
        {
            duration: 2000,
            step: function (now, fx) {
                var data = Math.round(now);
                $(this).html(data + '%');

            }
        }
    );

    $('.pbTravel').animate(
        { width: '10%' },
        {
            duration: 2000,
            step: function (now, fx) {
                var data = Math.round(now);
                $(this).html(data + '%');

            }
        }
    );
}