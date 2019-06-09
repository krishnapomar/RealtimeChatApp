var myApp = angular.module("AskApp", ['ngRoute', 'firebase']);

var config = {
    // Initialize Firebase
    apiKey: "AIzaSyCvDZ3eiYahjMyLo_LsBYVz1PcdzWxZyw0",
    authDomain: "askk-me.firebaseapp.com",
    databaseURL: "https://askk-me.firebaseio.com",
    projectId: "askk-me",
    storageBucket: "",
    messagingSenderId: "375849091041"
};

firebase.initializeApp(config);

myApp.config(function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

    $routeProvider
        .when('/', {
            templateUrl: 'pages/Home.html',
            controller: 'homeController'
        })

        .when('/Home', {
            templateUrl: 'pages/Home.html',
            controller: 'homeController'
        })

        .when('/Login', {
            templateUrl: 'pages/Login.html',
            controller: 'loginController'
        })

        .when('/Asked', {
            templateUrl: 'pages/Asked.html',
            controller: 'askedController'
        })

        .when('/Answered', {
            templateUrl: 'pages/Answered.html',
            controller: 'answeredController'
        })

        .when('/ContactUs', {
            templateUrl: 'pages/ContactUs.html',
            controller: 'contactUsController'
        })

        .when('/questions/:domainName', {
            templateUrl: 'pages/DomainDetails.html',
            controller: 'domainController'
        })

        .when('/questions/:domainName/:questionKey', {
            templateUrl: 'pages/QuestionDetails.html',
            controller: 'questionController'
        })

    //.otherwise({
    //    templateUrl: 'Index.html',
    //    controller: 'loginController'
    //});
});

angular.module('AskApp')
    .config(function ($httpProvider, $httpParamSerializerJQLikeProvider) {
        $httpProvider.defaults.transformRequest.unshift($httpParamSerializerJQLikeProvider.$get());
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8';
    });

myApp.controller("homeController", function ($scope, $window) {
    console.log("Inside homeController controller");

    onPageLoad("home");
    $scope.domainBtnclick = function (item) {
        $window.location.href = "/questions/" + item;
    };
});

myApp.controller("domainController", function ($scope, $routeParams, $firebaseArray, $window) {
    console.log("Inside Domain controller");
    $('#spinner').show();
    onPageLoad("domain");
    var domainName = $routeParams.domainName;
    var finalQuestions = [];
    $('#domainSelect').val(domainName);

    var dbRef = firebase.database().ref().child('DomainNames').child(domainName);
    $scope.questions = $firebaseArray(dbRef);
    $('#domainSelect').on('change', function () {
        $window.location.href = "/questions/" + this.value;
    });

    $('#searchText').on('input', function () {
        var newContent = [];
        finalQuestions.forEach(function ($question) {
            if ($question.chatMsg.toLowerCase().includes($('#searchText').val().toLowerCase())) {
                newContent.push($question);
            }
        });
        $scope.questions = newContent;
        $scope.$apply();
    });

    $scope.questions.$loaded().finally(function () {
        $('#spinner').hide();
        finalQuestions = $scope.questions;
    });

    $scope.selectQuestion = function (q) {
        var questionId = q.$id.replace('-', '');
        $window.location.href = "/questions/" + domainName + "/" + questionId;
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
            $window.location.href = "/Login";
        }
    };
});

myApp.controller("questionController", function ($scope, $routeParams, $firebaseArray, $firebaseObject, $window) {
    console.log("Inside questionController controller");
    $('#spinner').show();
    $('#zeroAnswers').hide();
    onPageLoad("question");
    $('#domainAnswerBanner').hide();

    var dbQuestionRef = firebase.database().ref().child('DomainNames').child($routeParams.domainName).child('-' + $routeParams.questionKey);
    $scope.questionDetails = $firebaseObject(dbQuestionRef);

    var dbCommentsRef = firebase.database().ref().child('DomainNames').child($routeParams.domainName).child('-' + $routeParams.questionKey).child('comments');
    $scope.answers = $firebaseArray(dbCommentsRef);

    $scope.answers.$loaded().finally(function () {
        if ($scope.answers.length == 0) {
            $('#zeroAnswers').show();
        }
        $('#spinner').hide();
        $('#domainAnswerBanner').show();
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
            $window.location.href = "/Login";
            $('#spinner').show();
        }
    };

    //$scope.answers.$watch(function (e) {
    //    if (e.event == "child_added") {
    //        console.log('Something changed');
    //        e.key
    //    }        
    //    console.log(e);
    //});

    //$scope.likeBtn = function ($answerID) {
    //    console.log("Inside Like btn method");
    //    var likes = dbCommentsRef.child($answerID).getItem('likes').val();
    //    likes = likes+1;
    //    dbCommentsRef.child($answerID).setItem('l   ikes', likes);
    //}
});

myApp.controller("askedController", function ($scope, $window, $firebaseArray) {
    console.log("Inside askedController controller");
    $('#spinner').show();
    onPageLoad("asked");
    var questionsList = [];
    var askedQuestions = [];

    var email = sessionStorage.getItem("email");
    if (!email) {
        $window.location.href = "/Login";
    }

    var dbRef = firebase.database().ref().child('DomainNames');
    questionsList = $firebaseArray(dbRef);

    questionsList.$loaded().finally(function () {
        questionsList.forEach(function (item) {
            for (prop in item) {
                if (prop.includes('-')) {
                    if (item[prop].chatEmail == email) {
                        var data = {};
                        data["domainName"] = item.$id;
                        data["questionID"] = prop;
                        data["chatMsg"] = item[prop].chatMsg;
                        data["chatTime"] = item[prop].chatTime;
                        askedQuestions.push(data);
                    }
                }
            }
        });
        $scope.askedQuestions = askedQuestions;
        $('#spinner').hide();
    });

    $scope.selectedAskedQuestion = function (q) {
        var id = q.questionID;
        var questionid = id.replace('-', '');
        $window.location.href = "/questions/" + q.domainName + "/" + questionid;
    };

    $('#searchText').on('input', function () {
        var newContent = [];
        askedQuestions.forEach(function ($question) {
            if ($question.chatMsg.toLowerCase().includes($('#searchText').val().toLowerCase())) {
                newContent.push($question);
            }
        });
        $scope.askedQuestions = newContent;
        $scope.$apply();
    });
});

myApp.controller("answeredController", function ($scope, $window, $firebaseArray) {
    console.log("Inside answeredController controller");
    $('#spinner').show();
    onPageLoad("answered");
    var questionsList = [];
    var answeredQuestions = [];

    var email = sessionStorage.getItem("email");
    if (!email) {
        $window.location.href = "/Login";
    }

    var dbRef = firebase.database().ref().child('DomainNames');
    questionsList = $firebaseArray(dbRef);

    questionsList.$loaded().finally(function () {
        questionsList.forEach(function (item) {
            for (prop in item) {
                if (prop.includes('-')) {
                    if (item[prop].comments != undefined) {
                        for (commentProp in item[prop].comments) {
                            if (item[prop].comments[commentProp].commentEmail == email) {
                                var data = {};
                                data["domainName"] = item.$id;
                                data["questionID"] = prop;
                                data["chatMsg"] = item[prop].chatMsg;
                                data["chatTime"] = item[prop].chatTime;
                                answeredQuestions.push(data);
                            }
                        }
                    }
                }
            }
        });
        $scope.answeredQuestions = answeredQuestions;
        $('#spinner').hide();
    });

    $scope.selectedAnsweredQuestion = function (q) {
        var id = q.questionID;
        var questionid = id.replace('-', '');
        $window.location.href = "/questions/" + q.domainName + "/" + questionid;
    };

    $('#searchText').on('input', function () {
        var newContent = [];
        answeredQuestions.forEach(function ($question) {
            if ($question.chatMsg.toLowerCase().includes($('#searchText').val().toLowerCase())) {
                newContent.push($question);
            }
        });
        $scope.answeredQuestions = newContent;
        $scope.$apply();
    });
});

myApp.controller("profileController", function ($scope, $window) {
    console.log("Inside profileController controller");
    $('#spinner').show();
    onPageLoad("profile");
    $('#spinner').hide();
});

myApp.controller("contactUsController", function ($scope, $window) {
    console.log("Inside contactUsController controller");

    onPageLoad("contact");

    $scope.isDisabled = false;
    $scope.focus = true;
    $scope.submit = function () {
        $scope.isDisabled = false;
        var dbFeedbackRef = firebase.database().ref().child('Feedback');
        var phoneNumber;
        if ($scope.custPhone) {
            phoneNumber = $scope.custPhone;
        }
        else {
            phoneNumber = "0000000000";
        }
        dbFeedbackRef.push({
            feedback: $scope.feedback,
            by: $scope.custName,
            email: $scope.custEmail,
            phone: phoneNumber,
            time: new Date().toLocaleDateString()
        });

        $scope.isDisabled = false;
        $scope.errormsg = null;
        $scope.custEmail = null;
        $scope.custName = null;
        $scope.custPhone = null;
        $scope.feedback = null;
        $scope.successmessage = "Thank you for your feedback !!!"
    };
});

myApp.controller("loginController", function ($scope, $window) {
    console.log("Inside login controller");

    onPageLoad("login");
    $('#errorMessage').hide();

    var token = sessionStorage.getItem("googleToken");
    if (!token) {
        $('#signOut').css('display', 'none');
    }
    else {
        $('#signIn').css('display', 'none');
    }

    $scope.onSignIn = function () {
        if (!token) {
            googleSignIn($window);
        }
        else {
            $window.location.href = "/Home";
        }
    };

    $scope.onSignOut = function () {
        if (token) {
            googleSignOut($window);
        }
    };
});

async function googleSignIn($window) {
    var provider = new firebase.auth.GoogleAuthProvider();
    await firebase.auth().signInWithPopup(provider).then(function (result) {
        console.log("Sign in successfull !!");
        sessionStorage.setItem("googleToken", result.credential.accessToken);
        sessionStorage.setItem("user", result.user.displayName);
        sessionStorage.setItem("profilePic", result.user.photoURL);
        sessionStorage.setItem("email", result.user.email);
        $window.history.go(-1);
    }).catch(function (error) {
        var errorMessage = error.message;
        $('#errorMessage').show();
        console.log(errorMessage);
    });
}

async function googleSignOut($window) {
    await firebase.auth().signOut().then(function () {
        $window.location.href = "/Home";
        console.log("Signed out successfully !!");
        sessionStorage.removeItem("googleToken");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("profilePic");
        sessionStorage.removeItem("email");
        // Sign-out successful.
    }).catch(function (error) {
        console.log(error.message);
        // An error happened.
    });
}

function onPageLoad($page) {
    closeNav();
    if ($page == "home" || $page == "contact") {
        $("#searchBtnHolder").hide();
    }
    else {
        $("#searchBtnHolder").show();
    }
    var profilePic = sessionStorage.getItem("profilePic")
    if (profilePic) {
        $("#userProfilePic").attr("src", profilePic);
    }
}
