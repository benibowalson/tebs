
var blnUserLoggedIn = false;
var blnIsAdmin = false;
var theUser = "";
var intCommentCount = 0;
var userNameFormat = /^[\w\s\#\-\_]{1,50}$/;
var newPostTitleFormat = /^[\w\s\#\-\_]{1,100}$/;
var newPostFormat = /^.{1,65000}$/;
var commentFormat = /^.{1,200}$/;
var passFormat = /^[^\-\']{1,50}$/;             //disallow just the hyphen and the single quote
var mediaNameFormat3 = /(\.mp4|\.mp3|\.ogg)$/i;
var mediaNameFormat2 = /\.(?:mp4|mp3|ogg)$/i;
var mediaNameFormat = /^.*\.(mp4|mp3|ogg)$/i;
var mediaTypeFormat = /^(?:video\/mp4|video\/ogg|audio\/mp3|audio\/ogg)$/i;
var photoFileFormat2 = /^(?:image\/jpg|image\/jpeg|image\/png|image\/gif)$/i;
var photoFileFormat = /^.*\.(jpg|jpeg|png|gif)$/i;
var emailFormat = /(^[a-zA-Z0-9\_\-]+\@[a-zA-Z]+\.[a-z]{2,4}\.[a-z]{2,4}$|^[a-zA-Z0-9\_\-]+\@[a-zA-Z]+\.[a-z]{2,4}$)/;
var maxMediaFileSize = 20971520;     //20MB
var maxPhotoFileSize = 512000;    //5kB
var arrUserInfo = [];
var myMediaFile = null;
var myPhotoFile = null;
var blnIntendingToPost = false;
var clickedReplyButtonID = null;
var postID = null;

$(document).ready(function(){
    //alert(location.href);


    $(document).keydown(function (e){
        checkPressedKey(e);
    });

    $("#ancLogin").click(function(e){
        !blnUserLoggedIn? showLoginModal(): doLogOut();
    });

    $("#ancSignUp").click(function(){
        if ($("#spnSignUp").html().toUpperCase() == "  SIGN UP") showSignUpModal();     //Note the double space
    });

    $("#btnLogin").click(function(){
        doLogin();
    });

    $("#mdlLogin").on('shown.bs.modal', function () {
        $("#txtUsername").val("").focus();
    });

    $("#mdlLogin").on('hidden.bs.modal', function () {
        $("#txtUsername").val("");
        $("#txtPassword").val("");
    });

    $("#mdlNewPost").on('shown.bs.modal', function () {
        $("#txtNewPostTitle").val("").focus();
    });

    $("#mdlNewPost").on('hidden.bs.modal', function () {
        $("#txtNewPostTitle").val("");
        $("#txtNewPost").val("");
    });

    $("#mdlNewMedia").on('shown.bs.modal', function () {
        
    });

    $("#mdlNewMedia").on('hidden.bs.modal', function () {
        $("#flNewMedia").prop("type", "").prop("type", "file");          //reset file input
        $("#flNewPhoto").prop("type", "").prop("type", "file");
        $("#dvReportMediaFile").empty();
        myMediaFile = null;
        myPhotoFile = null;
    });

    $("#mdlSignUp").on('shown.bs.modal', function () {
        $("#txtSignUpUsername").empty().focus();
    });

    $("#mdlSignUp").on('hidden.bs.modal', function () {
        resetSignUpModal()
    });

    $("#txtUsername").on('focus', function(){
        $("#h3LoginFeedback").empty();
    });

    $("#btnSavePost").click(function(){
        saveNewPost();
    });

    $("#flNewMedia").change(function (e) {
        getMediaFileInfo(e);
    });

    $("#flNewPhoto").change(function (e) {
        getPhotoFileInfo(e);
    });

    $("#btnUploadMedia").click(function(){
        uploadMediaFile();
    });

    
    $("#btnSignUp").click(function(){
        processSignUp();
    });

    doInitialDownload();
    //$("#mdlMediaConsult").modal({ backdrop: "static", keyboard: true });
    //if ($('#mdlMediaConsult').is(':visible')) $("#lblMediaConsultDate").html(todaysDate());
});


function doInitialDownload(){
    $.ajax({url: "../scripts/php/studioblog.php", type: "POST", data: {operation:"INITIAL_DOWNLOAD_STUDIO"}, success: function(intialStudioDownloadResponseData){
        var myStudioDownloadResponse = JSON.parse(intialStudioDownloadResponseData);
        if(myStudioDownloadResponse.length > 1){        //success
            var arrBlogPosts = [];
            var arrMediaList = [];
            arrBlogPosts = JSON.parse(myStudioDownloadResponse[1]);     
            arrMediaList = JSON.parse(myStudioDownloadResponse[2]);     
            if(arrBlogPosts.length > 0){
                loadAllPosts(arrBlogPosts);
                $("#spnNavbarTopic").empty().append(arrBlogPosts[arrBlogPosts.length - 1].Title);   //latest blog post title
                $('#dvDepot').empty().append(arrBlogPosts[arrBlogPosts.length - 1].Post);           //show latest blog post
                postID = arrBlogPosts[arrBlogPosts.length - 1].id;                                  //id of lateset post

                if (!blnUserLoggedIn) {
                    $("#dvCommentButton").append('<button class="btn btn-info btn-xs" id="btnComment">Comment</button><span id="spnLoginInstruction" style="color: white"> Login to Comment</span>');
                } else {    //logged in
                    $("#dvCommentButton").append('<button class="btn btn-info btn-xs" id="btnComment">Comment</button>');
                }

                $("#btnComment").on("click", function(e){
                    handleCommentIntent(e);
                });

                //load comments if any
                arrLatestPostComments = JSON.parse(myStudioDownloadResponse[3]);
                if(arrLatestPostComments.length > 0){
                    $("#dvComments").empty();
                    loadComments(arrLatestPostComments);
                }

            } else {
                $("#dvCommentButton").empty();
            }

            //Media List
            if(arrMediaList.length > 0) loadAllMedia(arrMediaList);

            //Landing from eMail Address
            if(isEmailVerify()){
                var myHref = location.href;
                var token = myHref.substring(myHref.indexOf("=") + 1);
                var myData = {dToken: token, operation: "VERIFIED_LOGIN"};
                $.ajax({url: "../scripts/php/studioblog.php", type: "POST", data: myData, success: logUserIn});
            }

        } else {        //show error
            alert(myStudioDownloadResponse[0]);
        }
    }});
}

function loadAllPosts(arrBlogPosts){
    $('#dvTopics').empty().append('<h4>POSTS</h4>');
    for (i = arrBlogPosts.length - 1; i >= 0; i--) {
        $("#dvTopics").append('<a href="#" id="topic' + arrBlogPosts[i].id + '" class="btn btn-default">' + arrBlogPosts[i].Title + '</a><br>');
        $('#topic' + arrBlogPosts[i].id).click(function (e) {
            loadPostWithComments(e);
        });
    }

    if(blnIsAdmin) createAddNewPostButton();

    $("#spnNavbarTopic").empty().append(arrBlogPosts[arrBlogPosts.length - 1].Title);   //title of latest blog post
    $('#dvDepot').empty().append(arrBlogPosts[arrBlogPosts.length - 1].Post);           //show latest blog post
    postID = arrBlogPosts[arrBlogPosts.length - 1].id;              //current post
}

function loadAllMedia(arrMediaList){
    $("#dvMediaList").empty();
    //alert(arrMediaList[0].AlbumPhotoPath);
    for (i = 0; i < arrMediaList.length; i++) {
        var mediaFileName = arrMediaList[i].Filename;
        var photoFileName = arrMediaList[i].AlbumPhotoFilename;
        //var mediaFileType = mediaFileName.substring(mediaFileName.length - 3);
        //var prefix = (mediaFileType == "mp4") ? "video/" : "audio/";
        $("#dvMediaList").append('<div class="Item"' + arrMediaList[i] + '"><a id="media' + arrMediaList[i].id + '" href="#" class="btn btn-default"><img src="' + arrMediaList[i].AlbumPhotoPath + '" width="100%"/><br /><span>' + mediaFileName + '</span></a></div>');
        //$("#dvMediaList").append('<a href id="media' + arrMediaList[i].id + '" class="btn btn-default">' + mediaFileName + '</a><br />');
        $("#media" + arrMediaList[i].id).click({dPath: arrMediaList[i].Path, dPhotoPath: arrMediaList[i].AlbumPhotoPath}, function (e) {
            mediaItemClick(e);
        });
    }

    if(blnIsAdmin) createAddNewMediaButton();

    playMedia({dPath: arrMediaList[0].Path});
}

function loadComments(arrComments){
    //$("#dvComments").empty();                               //clear comments of previous post
    for(i = 0; i < arrComments.length; i++){
        var commentData = {dID: arrComments[i].id, dMotherCommentID: arrComments[i].MotherCommentID, dType: arrComments[i].Type, dComment: arrComments[i].Comment, dCommentOwner: arrComments[i].Owner, dPostID: arrComments[i].PostID, dPostTime: arrComments[i].PostTime};
        pasteAComment(commentData);
    }
}

function mediaItemClick(e){
    e.preventDefault();
    playMedia(e.data);
}

function playMedia(data){
    var myPlayer = document.getElementById("mediaPlayer");
    var dSrc = document.getElementById("src1");
    if (mediaPlayerIsPlaying(myPlayer)) myPlayer.pause();
    dSrc.src = data.dPath;
    //dSrc.title = eData.dName.substring(0, eData.dName.indexOf("."));
    myPlayer.load();
    myPlayer.play();
}

function loadPostWithComments(e){
    var anchorID = (e.target) ? e.currentTarget.id : e.srcElement.id;
    postID = anchorID.substring(5);         //e.g id of topic3 returns 3
    $.ajax({url: "../scripts/php/studioblog.php", type: "POST", data: {operation: "GET_POST_BY_ID", post_ID: postID}, success:function(getStudioPostByIdResponseData){
        var myGetStudioPostByIdResponse = JSON.parse(getStudioPostByIdResponseData);
        if(myGetStudioPostByIdResponse.length > 1){     //success
            var arrMyPost = JSON.parse(myGetStudioPostByIdResponse[1]); //get current post
            $("#spnNavbarTopic").empty().append(arrMyPost[0].Title);
            $('#dvDepot').empty().append(arrMyPost[0].Post);            //show current post

            //Now load comments
            if(myGetStudioPostByIdResponse.length > 2){                 //comments available
                var arrComments = JSON.parse(myGetStudioPostByIdResponse[2]);
                $("#dvComments").empty();
                if(arrComments.length > 0) loadComments(arrComments);
            }
        }
    }});
}

function pasteAComment(commentData){
    var dvCurrentComment = '<div id="dvCurrentComment' + commentData.dID + '"></div>';
    var myNewDiv;
    if(commentData.dType == "Comment"){
        $("#dvComments").append(dvCurrentComment);
        myNewDiv = $("#dvCurrentComment" + commentData.dID);
        myNewDiv.addClass("comment").addClass("motherComment");
    } else {
        $(dvCurrentComment).insertBefore("#btnReply" + commentData.dMotherCommentID);
        myNewDiv = $("#dvCurrentComment" + commentData.dID);
        myNewDiv.addClass("comment").addClass("replyComment");
    }

    var ownerToPrepend = (commentData.dType == "Comment")? "": "@" + commentData.dCommentOwner;
    var momentObj = moment(commentData.dPostTime);      //create momemt class object from moment library
    var formattedTime = momentObj.format('HH:mm:ss MMMM D, YYYY');
    myNewDiv.append((ownerToPrepend.length)? ('<small class="boldUserName">'+ ownerToPrepend +'</small>, ' + commentData.dComment): commentData.dComment);
    myNewDiv.append('  <br />~<small class="boldUserName">[' + commentData.dCommentOwner + '] at ' + formattedTime + '</small>');  //append Commenter and timestamp

    if(commentData.dType == "Comment"){
        myNewDiv.append('<div id="divX"' + commentData.dID + '><button id="btnReply' + commentData.dID + '" class="btn btn-info btn-xs">Reply</button></div>');
    } else {
        myNewDiv.append('<button id="btnReply' + commentData.dID + '" class="btn btn-info btn-xs pull-right">Reply</button>');
    }

    resetCommentButtons();
    $("#btnReply" + commentData.dID).click(commentData, function (e) {
        handleReplyIntent(e);
    });
}

function handleReplyIntent(e) {
    if(!blnUserLoggedIn) return;
    var replyButtonID = (e.target) ? e.currentTarget.id : e.srcElement.id;
    var eventData = e.data;                  //Data bundled with event in caller function

    blnIntendingToPost = true;
    disableLinksAndButtons(e);

    if ($("#" + replyButtonID).html().toUpperCase() == "REPLY"){

       clickedReplyButtonID = replyButtonID;

        var textAreaHtml = newReactionDiv();
        //$("#dvCurrentComment" + eventData.dMotherCommentID).append(textAreaHtml);
        $(textAreaHtml).insertBefore("#" + replyButtonID);
        $("#" + replyButtonID).empty().html('Post Reply');
        $("#dvNewReaction").append('<button id="btnCancelNewReaction" class="btn btn-info btn-xs pull-right">Cancel</button>');
        $("#txtNewReaction").focus();
        $("#btnCancelNewReaction").click(function () {
            resetCommentButtons();
        });

   } else if ($("#" + replyButtonID).html().toUpperCase() == "POST REPLY"){
        var theReply = $.trim($("#txtNewReaction").val());
        if (!newPostFormat.test(theReply)) {
            $("#spnFeedback").empty().html("Errors in post!");
            return;
        }

        var myAjaxData = { operation: "POST_REPLY", dReply: theReply, dOwner: sessionStorage.theUser, dType: "Reply", dMotherCommentID: eventData.dMotherCommentID, dPostID: eventData.dPostID };
        $.ajax({
            url: "../scripts/php/studioblog.php", type: "POST", data: myAjaxData, success: function (postCommentResponseData) {
                var myPostReplyResponse = JSON.parse(postCommentResponseData);
                if (myPostReplyResponse.length > 1) {         //success
                    $("#dvNewReaction").remove();  //remove div containing textarea
                    var arrMostRecentComment = JSON.parse(myPostReplyResponse[1]);
                    var commentData = { dID: arrMostRecentComment[0].id, dPostID: arrMostRecentComment[0].PostID, dType: arrMostRecentComment[0].Type, dMotherCommentID: arrMostRecentComment[0].MotherCommentID, dComment: arrMostRecentComment[0].Comment, dCommentOwner: arrMostRecentComment[0].Owner, dPostTime: arrMostRecentComment[0].PostTime };
                    pasteAComment(commentData);
                } else {
                    //$("#spnFeedback").empty().html(myPostReplyResponse[0]);
                    alert(myPostReplyResponse[0]);
                }
            }
        });
    }
}

function handleCommentIntent(ev){

    if (!blnUserLoggedIn) {
        return
    };

    blnIntendingToPost = true;
    disableLinksAndButtons(ev);

    var commentButtonID = (ev.target) ? ev.currentTarget.id : ev.srcElement.id;
    clickedReplyButtonID = null;

    if($("#" + commentButtonID).html().toUpperCase() == "COMMENT"){
        var textAreaHtml = newReactionDiv();
        $(textAreaHtml).insertBefore("#dvCommentButton");
        $("#btnComment").empty().html('Post Comment');
        $("#dvCommentButton").append('<button id="btnCancelNewReaction" class="btn btn-info btn-xs">Cancel</button>');
        $("#txtNewReaction").focus();
        $("#btnCancelNewReaction").click(function () {
            resetCommentButtons();
        });
    } else {            //POST COMMENT
        //Save Comment
        var theComment = $.trim($("#txtNewReaction").val());
        if (!newPostFormat.test(theComment)) {
            $("#spnFeedback").empty().html("Errors in post!");
            return;
        }

        myAjaxData = { operation: "POST_COMMENT", dComment: theComment, dType: "Comment", dOwner: sessionStorage.theUser, dPostID: postID };
        $.ajax({
            url: "../scripts/php/studioblog.php", type: "POST", data: myAjaxData, success: function (postCommentResponseData) {
                var myPostReplyResponse = JSON.parse(postCommentResponseData);
                if (myPostReplyResponse.length > 1) {         //success
                    $("#dvNewReaction").remove();  //remove div containing textarea
                    var arrMostRecentComment = JSON.parse(myPostReplyResponse[1]);
                    var commentData = {dID: arrMostRecentComment[0].id, dPostID: arrMostRecentComment[0].PostID, dType: arrMostRecentComment[0].Type, dMotherCommentID: arrMostRecentComment[0].MotherCommentID, dComment: arrMostRecentComment[0].Comment, dCommentOwner: arrMostRecentComment[0].Owner, dPostTime: arrMostRecentComment[0].PostTime};
                    pasteAComment(commentData);
                } else {
                    //$("#spnFeedback").empty().html(myPostReplyResponse[0]);
                    alert(myPostReplyResponse[0]);
                }
            }
        });
    }
}

function resetCommentButtons(){    

    blnIntendingToPost = false;
    $("#dvNewReaction").remove();              //remove div containing textArea
    $("#btnCancelNewReaction").remove();            //remove cancel button

    $('button').prop('disabled', false);        //enable all buttons

    if (clickedReplyButtonID) $("#" + clickedReplyButtonID).html('Reply');        //restore text on Reply button
    $("#btnComment").html("Comment");

    clickedReplyButtonID = null;
}

function disableLinksAndButtons(ev){
    var myButtonID = (ev.target) ? ev.currentTarget.id : ev.srcElement.id;
    $('a').on('click', function(e){
        if(blnIntendingToPost) e.preventDefault();
    });

    if(blnIntendingToPost){
        $('button').prop('disabled', true);
        $('button[id*=Cancel]').prop('disabled', false);
        $("#" + myButtonID).prop('disabled', false);
    }
}

function newReactionDiv(){
    var textAreaHtml = '<div id="dvNewReaction"><textarea id="txtNewReaction" class="form-control" maxlength="500" placeholder="Comment Here" width="90%" height="5%" style="{margin: 2%}"></textarea></div>';
    return textAreaHtml;
}

function showLoginModal() {
    $("#mdlLogin").modal({ backdrop: "static", keyboard: true });
}

function showSignUpModal() {
    $("#mdlSignUp").modal({ backdrop: "static", keyboard: true });
}

function checkPressedKey(e){
    if(e.which == 13){                  //[ENTER] pressed
        if($('#mdlLogin').is(':visible')) $("#btnLogin").trigger("click");
        if ($('#mdlNewMedia').is(':visible')) $("#btnUploadMedia").trigger("click");
        if ($('#mdlSignUp').is(':visible')) $("#btnSignUp").trigger("click");
    }

    if(e.which == 27){                  //[ESC] pressed

    }
}

function doLogin(){
    var strUsername = $.trim($("#txtUsername").val());
    var strPassword = $("#txtPassword").val();
    $.ajax({ url: "../scripts/php/studioblog.php", type: "POST", data:{operation: "LOGIN", dUserName: strUsername, dPassword: strPassword}, success:logUserIn});
}

function logUserIn(loginResponse){
    var arrLoginResponse = JSON.parse(loginResponse);
    if (arrLoginResponse.length > 1) {        //good server response
        var myLoginResult = arrLoginResponse[0];
        if (myLoginResult.toUpperCase() == "PASS") {
            //Login
            arrUserInfo = JSON.parse(arrLoginResponse[1]);
            blnUserLoggedIn = true;
            sessionStorage.theUser = arrUserInfo[0].Name;
            sessionStorage.Uid = arrUserInfo[0].id;       //php sent a single row
            blnIsAdmin = (arrUserInfo[0].IsAdmin == 1) ? true : false;               //admin status

            $('#spnFeedback').empty().html("Welcome " + sessionStorage.theUser + "!");
            $("#spnSignUp").empty().html('  ' + sessionStorage.theUser);
            $("#glyphLogin").removeClass("glyphicon-log-in").addClass("glyphicon-log-out");
            $("#spnUserLogin").empty().html("  Log Out");
            $("#spnLoginInstruction").remove();
            if (blnIsAdmin) {
                createAddNewPostButton();
                createAddNewMediaButton();
            }
            $("#mdlLogin").modal('hide');           //close login dialogue

        } else {
            $("#dvReportLogin").empty().html("Invalid Credentials!");
        }
    } 
}

function doLogOut(){
    blnUserLoggedIn = false;
    sessionStorage.theUser = null;
    sessionStorage.Uid = null;
    arrUserInfo = null;
    $("#dvNewPostButtons").remove();
    $("#dvNewMediaButtons").remove();
    $("#spnFeedback").empty().html("Logged Out !");
    $("#spnSignUp").empty().html("  Sign Up");
    $("#glyphLogin").removeClass("glyphicon-log-out").addClass("glyphicon-log-in");
    $("#spnUserLogin").empty().html("  Log In Here");
    if ($('#btnComment').is(':visible')){
        $("#dvCommentButton").append('<span id="spnLoginInstruction" style="color: white"> Login to Comment</span>');
    }

    $("#mdlLogin").modal('hide');
}

function createAddNewPostButton(){
    $("#dvTopics").append('<div id="dvNewPostButtons" class="buttonHolderDiv"><button id="btnNewPost" class="btn btn-success">Add New Post</button></div>');
    $("#btnNewPost").click(function (e) {
        $("#mdlNewPost").modal({ backdrop: "static", keyboard: true });
    });
}

function createAddNewMediaButton(){
    $("#dvMediaList").append('<div id="dvNewMediaButtons" class="buttonHolderDiv"><button id="btnNewMedia" class="btn btn-success">Add New Media</button></div>');
    $("#btnNewMedia").click(function (e) {
        $("#mdlNewMedia").modal({ backdrop: "static", keyboard: true });
    });
}

function saveNewPost(){

    var strNewPost = $("#txtNewPost").val();
    if(!newPostFormat.test(strNewPost)){
        $("#dvReportPost").empty().html("Error in Post");
        return;
    }

    var strNewPostTitle = $.trim($("#txtNewPostTitle").val());
    if(!newPostTitleFormat.test(strNewPostTitle)){
        $("#dvReportPost").empty().html("Bad Post Title");
        return;
    }

    if(!confirm("Save post? Sure?")) return;

    myData = {dTitle: strNewPostTitle, dPost: strNewPost, operation: "SAVE_NEW_POST"};
    $.ajax({ url: "../scripts/php/studioblog.php", type: "POST", data: myData, success: function(savePostResponse){
        var mySavePostResponse = JSON.parse(savePostResponse);
        if(mySavePostResponse.length > 1){      //good server response
            //Clear previous post comments
            $("#dvComments").empty();
            var arrPostsList = JSON.parse(mySavePostResponse[1]);
            loadAllPosts(arrPostsList);
            $("#mdlNewPost").modal('hide');
            if(arrPostsList.length == 1){       //very first post
                if(!blnUserLoggedIn){
                    $("#dvCommentButton").append('<button class="btn btn-info btn-xs" id="btnComment">Comment</button><span id="spnLoginInstruction" style="color: white"> Login to Comment</span>');
                } else {
                    $("#dvCommentButton").append('<button class="btn btn-info btn-xs" id="btnComment">Comment</button>');
                }

                $("#btnComment").on("click", function (e) {
                    handleCommentIntent(e);
                });
            }
        } else {
            alert(mySavePostResponse[0]);
        }
    }});
}

function fileAPIsupported() {
    var supported = false;
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        supported = true;
    }

    if (!supported) {
        alert('File API not supported by your browser! \n\nPlease update your browser!');
    }

    return supported;
}

function filesAreOkay(aMediaFile, aPhotoFile) {
    var okay = true;
    if(!aMediaFile){                 //null situation
        return false;
    } 

    /*var files = e.target.files;
    var userFile = files[0];        //the File
    var userFileType = userFile.type;           //the File type
    var userFileSize = userFile.size;
    var userFileName = userfile.name    //the File size*/

    var strFileReport = "";


    if (!mediaNameFormat.test(aMediaFile.name)) {
        okay = false;
        strFileReport += "Unsupported media format";
    }

    if (aMediaFile.size > maxMediaFileSize) {
        okay = false;
        strFileReport += (strFileReport.length)? " | Media file too large": "Media file too large";
    }

    if(aPhotoFile && !photoFileFormat.test(aPhotoFile.name)){
        okay = false;
        strFileReport += (strFileReport.length) ? " | Unsupported picture format" : "Unsupported picture format";
    }

    if(aPhotoFile && aPhotoFile.size > maxPhotoFileSize){
        okay = false;
        strFileReport += (strFileReport.length) ? " | Picture too large" : "Picture too large";
    }

    if (!okay) {
        $("#dvReportMediaFile").html(strFileReport);
    } else {
        $("#dvReportMediaFile").empty();
    }

    return okay;
}

function getMediaFileInfo(e) {
    myMediaFile = (fileAPIsupported())? e.target.files[0]: null;
    if ($('#mdlNewMedia').is(':visible')) $("#btnUploadMedia").focus();
}


function getPhotoFileInfo(e){
    myPhotoFile = (fileAPIsupported())? e.target.files[0]: null;
    if ($('#mdlNewMedia').is(':visible')) $("#btnUploadMedia").focus();
}

function uploadMediaFile(){
    if(filesAreOkay(myMediaFile, myPhotoFile)){
        var myFormData = new FormData();
        myFormData.append("operation", "UPLOAD_MEDIA_FILES");
        myFormData.append("dMediaFile", myMediaFile);
        myFormData.append("dPhotoFile", myPhotoFile);
        myFormData.append('dUser', sessionStorage.theUser);

        $("#dvReportMediaFile").empty().html("...Sending...Please wait...");

        $.ajax({url: "../scripts/php/studioblog.php", type: "POST", data: myFormData, processData: false, contentType: false, success: function(mediaUploadResponse){
            var myMediaUploadResponse = JSON.parse(mediaUploadResponse);
            if(myMediaUploadResponse.length > 1){
                var myNewMediaList = [];
                myNewMediaList = JSON.parse(myMediaUploadResponse[1]);
                loadAllMedia(myNewMediaList);
                $("#mdlNewMedia").modal('hide');
            } else {
                alert(myMediaUploadResponse[0]);
                $("#dvReportMediaFile").empty().html(myMediaUploadResponse[0]);
            }
        }});
    }
}

function mediaPlayerIsPlaying(objMediaPlayer) {
    return (objMediaPlayer.currentTime > 0 && !objMediaPlayer.paused && !objMediaPlayer.ended && objMediaPlayer.readyState > 2);
}

function processSignUp(){

    var userName = $.trim($("#txtSignUpUsername").val());
    var email = $.trim($("#txtSignUpEmail").val());
    var passWord = $("#txtSignUpPassword").val();
    var confirmPassWord = $("#txtCSignUpPassword").val();

    if(!signUpInfoGood(userName, email, passWord, confirmPassWord)) return;

    $("#dvReportSignUp").empty().html("...Sending...Please wait...");

    var myData = {dUsername: userName, dEmail: email, dPassword: passWord, operation: "SIGN_UP"};
    $.ajax({url: "../scripts/php/studioblog.php", type: "POST", data: myData, success: function(signUpResponse){
        var myResponse = JSON.parse(signUpResponse);
        if(myResponse.length > 1){
            var message = myResponse[1];
            $("#spnFeedback").empty().html(message);
            $("#mdlSignUp").modal('hide');
        } else {
            $("#dvReportSignUp").empty().html(myResponse[0]);
        }
    }});
}

function signUpInfoGood(userName, email, passWord, confirmPassWord){
    var infoGood = true;
    var errMsg = "";
    if(!userNameFormat.test(userName)){
        infoGood = false;
        errMsg += "Bad Username";
    }

    if(!emailFormat.test(email)){
        infoGood = false;
        errMsg += (errMsg.length)? " | Bad email": "Bad email"
    }

    if(!passFormat.test(passWord)){
        infoGood = false;
        errMsg += (errMsg.length)? " | Bad password": "Bad password";
    }

    if(passWord != confirmPassWord){
        infoGood = false;
        errMsg += (errMsg.length)? " | Password Mismatch": "Password Mismatch";
    }

    if(!infoGood){
        $("#dvReportSignUp").html(errMsg);
    } else {
        $("#dvReportSignUp").empty();
    }

    return infoGood;
}

function resetSignUpModal(){
    $("#txtSignUpUsername").empty();
    $("#txtSignUpEmail").empty();
    $("#txtSignUpPassword").empty();
    $("#txtCSignUpPassword").empty();
    $("#dvReportSignUp").empty();
}

function isEmailVerify(){
    return (location.href.indexOf("?token=") > -1);
}

function todaysDate(){
    return moment().format('MMMM D, YYYY');
}


