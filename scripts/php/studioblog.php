<?php

    include_once("../../creds/creds.php");

    date_default_timezone_set('Africa/Lagos');
    
    $myLink;
    
    $operation = (isset($_POST['operation']))? $_POST['operation']: null;

    if($operation){
        switch($operation){
            case "INITIAL_DOWNLOAD_STUDIO":
                if(!dbConnectionSuccessful($myLink, "dbBlogs")) die(json_encode(array('DB Connectivity Error!')));

                $arrStudioPosts = array();
                $arrStudioPosts = getAllPosts($myLink);

                $arrMediaList = array();
                $arrMediaList = getMediaList($myLink);

                //get ID of most recent post
                $qString = "select id from tblStudioBlogPosts order by PostTime DESC limit 1;";
                $qResult = executeQuery($myLink, $qString);

                $arrLatestPostComments = array();
                if($qResult->num_rows > 0){
                    //get comments for latest post
                    $latestPostID = $qResult->fetch_assoc()['id'];
                    $arrLatestPostComments = getPostComments($myLink, $latestPostID);
                }

                die(json_encode(array('Yep!', json_encode($arrStudioPosts), json_encode($arrMediaList), json_encode($arrLatestPostComments))));

                break;
            case "LOGIN":
                if(!dbConnectionSuccessful($myLink, "dbBlogs")) die(json_encode(array('DB Connectivity Error!')));
                $userName = sanitized($_POST['dUserName']);
                $password = sanitized($_POST['dPassword']);            
                $qString = "select * from tblUsers where UPPER(Name) = UPPER('$userName') AND Password = sha1('$password') AND EmailConfirmed = 1;";
                queryForLogin($myLink, $qString);
                break;
            
            case "VERIFIED_LOGIN":
                if(!dbConnectionSuccessful($myLink, "dbBlogs")) die(json_encode(array('DB Connectivity Error!')));
                $token = $_POST['dToken'];
                $qString = "select * from tblUsers where Token = '$token';";
                queryForLogin($myLink, $qString);
                break;

            case "GET_POST_BY_ID":
                if(!dbConnectionSuccessful($myLink, "dbBlogs")) die(json_encode(array('DB Connectivity Error!')));
                $postID = sanitized($_POST['post_ID']);
                $qString = "select * from tblStudioBlogPosts where id = $postID;";
                $qResult = executeQuery($myLink, $qString);

                $arrPost = array();
                $arrPost[] = $qResult->fetch_assoc();

                $arrPostComments = array();
                $arrPostComments = getPostComments($myLink, $postID);

                die(json_encode(array('Yep!', json_encode($arrPost), json_encode($arrPostComments))));         //response length = 3
                break;
                
            case "SAVE_NEW_POST":
                if(!dbConnectionSuccessful($myLink, "dbBlogs")) die(json_encode(array('DB Connectivity Error!')));
                $newPostTitle = sanitized($_POST['dTitle']);
                $newPostTitle = $myLink->real_escape_string($newPostTitle);
                $newPost = sanitized($_POST['dPost']);
                $newPost = $myLink->real_escape_string($newPost);

                $qString = "insert into tblStudioBlogPosts values(null, UPPER('$newPostTitle'), '$newPost', NOW());";
                $qResult = executeQuery($myLink, $qString);

                $arrPostsList = array();
                $arrPostsList = getAllPosts($myLink);
                die(json_encode(array('Yeah', json_encode($arrPostsList))));
                break;

            case "POST_COMMENT":

                if(!dbConnectionSuccessful($myLink, "dbBlogs")) die(json_encode(array('DB Connectivity Error!')));

                $theComment = $myLink->real_escape_string(sanitized($_POST['dComment']));
                $theOwner = sanitized($_POST['dOwner']);
                $theType = sanitized($_POST['dType']);
                $thePostID = sanitized($_POST['dPostID']);

                $qString = "insert into tblStudioBlogComments(id, PostID, Type, Comment, Owner, PostTime) values(null, $thePostID, '$theType', '$theComment', '$theOwner', NOW());";
                $qResult = executeQuery($myLink, $qString);

                //latest comment id
                $newID = $myLink->insert_id;

                //For top level comments, since no mother comment, take ID as MotherCommentID
                $qStr = "update tblStudioBlogComments set MotherCommentID = $newID where id = $newID;";
                $qRes = executeQuery($myLink, $qStr);

                $qString = "select * from tblStudioBlogComments where id = $newID;";
                $qResult = executeQuery($myLink, $qString);

                $arrLatestComment = array();
                $arrLatestComment[] = $qResult->fetch_assoc();            //single row;

                die(json_encode(array('Yeah', json_encode($arrLatestComment))));
                break;

            case "POST_REPLY":

                if(!dbConnectionSuccessful($myLink, "dbBlogs")) die(json_encode(array('DB Connectivity Error!')));

                $theReply = $myLink->real_escape_string(sanitized($_POST['dReply']));
                $theOwner = sanitized($_POST['dOwner']);
                $theType = sanitized($_POST['dType']);
                $thePostID = sanitized($_POST['dPostID']);
                $theMotherCommentID = sanitized($_POST['dMotherCommentID']);

                $qString = "insert into tblStudioBlogComments values(null, $thePostID, '$theType', $theMotherCommentID, '$theReply', '$theOwner', NOW());";
                $qResult = executeQuery($myLink, $qString);

                $newID = $myLink->insert_id;
                $qString = "select * from tblStudioBlogComments where id = $newID;";
                $qResult = executeQuery($myLink, $qString);

                $arrLatestComment = array();
                $arrLatestComment[] = $qResult->fetch_assoc();

                die(json_encode(array('Mhmm', json_encode($arrLatestComment))));
                break;
            
            case "UPLOAD_MEDIA_FILES":
                if(!dbConnectionSuccessful($myLink, "dbBlogs")) die(json_encode(array('DB Connectivity Error!')));
                $mediaFileName = (isset($_FILES['dMediaFile']['name']))? $_FILES['dMediaFile']['name']: null;
                $photoFileName = (isset($_FILES['dPhotoFile']['name']))? $_FILES['dPhotoFile']['name']: null;
                $dUser = $myLink->real_escape_string(sanitized($_POST['dUser']));
                //$extn = ($mediaFileName)? substr($mediaFileName, strpos($mediaFileName, "."), strlen($mediaFileName) - strpos($mediaFileName, ".")): null;          //".jpg" -> the dot inclusive
                if($mediaFileName){
                    //$fileExtension = substr($mediaFileName, strrpos($mediaFileName, ".") + 1);        //condensed
                    $lastIndexOfDot = strrpos($mediaFileName, ".");     //strrpos() instead of strpos()
                    $fileExtension = substr($mediaFileName, $lastIndexOfDot + 1);
                    $fileExtension = strtolower($fileExtension);        //lowercase
                    $uploadDirectory = $_SERVER['DOCUMENT_ROOT'].'/tebsgroup/blogs/media/';
                    //3 media folders: mp4, mp3 and ogg
                    $uploadDirectory .= ($fileExtension == 'mp4')?('mp4/'):(($fileExtension == 'mp3')?'mp3/':'ogg/');
                    $uploadDirectory .= $mediaFileName;
                    if(file_exists($uploadDirectory)){
                        die(json_encode(array('File with same name already exists!')));
                    }

                    if(!move_uploaded_file($_FILES['dMediaFile']['tmp_name'], $uploadDirectory)){
                        die(json_encode(array('Media upload failed!')));
                    }
                    
                    $dbMediaFilePath = 'media/';
                    $dbMediaFilePath .= ($fileExtension == 'mp4')?('mp4/'):(($fileExtension == 'mp3')?'mp3/':'ogg/');
                    $dbMediaFilePath .= $mediaFileName;

                    $qString = "insert into tblMediaList(id, Path, Filename, WhoUploaded, UploadTime) values(null, '$dbMediaFilePath', '$mediaFileName','$dUser', NOW());";
                    $qResult = executeQuery($myLink, $qString);

                    $newID = $myLink->insert_id;

                    //Album Art
                    if($photoFileName){
                        $photoUploadDirectory = $_SERVER['DOCUMENT_ROOT'].'/tebsgroup/blogs/photos/'.$photoFileName;
                        if(!move_uploaded_file($_FILES['dPhotoFile']['tmp_name'], $photoUploadDirectory)){
                            die(json_encode(array('Album art upload failed!')));
                        }

                        $photoPath = 'photos/'.$photoFileName;
                        $qStr = "update tblMediaList set AlbumPhotoPath = '$photoPath', AlbumPhotoFilename = '$photoFileName' where id = $newID;";
                        $qRes = executeQuery($myLink, $qStr);
                    }

                    $arrMediaList = array();
                    $arrMediaList = getMediaList($myLink);

                    die(json_encode(array('Yep', json_encode($arrMediaList), 'Upload Successful!')));
                }

                break;
            
            case "SIGN_UP":
                if(!dbConnectionSuccessful($myLink, "dbBlogs")) die(json_encode(array('DB Connectivity Error!')));
                $userName = $myLink->real_escape_string(sanitized($_POST['dUsername']));
                $passWord = $myLink->real_escape_string(sanitized($_POST['dPassword']));
                $email = $myLink->real_escape_string(sanitized($_POST['dEmail']));

                //Check Username is unique
                $qString = "select * from tblUsers where UPPER(Name) = UPPER('$userName');";
                $qResult = executeQuery($myLink, $qString);

                if($qResult->num_rows > 0){
                    die(json_encode(array('Username already taken')));
                }

                //Generate a token
                $tokenString = "QWERTYUIOPASDFGHJKLZXCVBNM1234567890!@()$^,*qwertyuiopasdfghjklzxcvbnm";
                $token = "";
                $blnTokenIsUnique = false;
                //Ensure token is unique for each user
                while(!$blnTokenIsUnique){
                    $tokenString = str_shuffle($tokenString);
                    $token = substr($tokenString, 0, 25);
                    $qStr = "select id from tblUsers where Token = '$token';";
                    $qRes = executeQuery($myLink, $qStr);

                    if($qRes->num_rows == 0){
                        $blnTokenIsUnique = true;
                    }
                }


                //Send Email
                $msg = "";
                try {
                    require_once("PHPMailer/PHPMailerAutoload.php");
                    $mail = new PHPMailer();

                    $mail->IsSmtp();            //remove this line when on live hosting server
                    //$mail->SMTPDebug = 0;
                    $mail->SMTPAuth = true;
                    $mail->SMTPSecure = 'tls';  //ssl or tls
                    $mail->Host = 'smtp.gmail.com';
                    $mail->Port = 587;  //or 587 or 465 (for ssl)
                    $mail->Username = gmailUser;
                    $mail->Password = gmailPass;

                    $mail->setFrom(gmailUser, "Tebs Group");
                    $mail->addAddress($email, $userName);
                    $mail->Subject = 'Verify Your Email';
                    //$mail->addReplyTo('theprofhimself@gmail.com', 'Prof B');
                    $mail->isHTML(true);
                    $mail->Body = 'Hello ' . $userName .', <br /><br /> Click link below to verify your email.<br /><br />';
                    $mail->Body .= "<a href='http://localhost/tebsgroup/scripts/php/studioblog.php?email=$email&token=$token'>Click Here</a>";
                    
                    if($mail->send()){
                        $qString = "insert into tblUsers (id, Name, Email, Password, Token) values (null, '$userName', '$email', sha1('$passWord'), '$token');";
                        $qResult = executeQuery($myLink, $qString);

                        $msg = "You're registered. Check your email and verify your address.";
                    } else {
                        $msg = $mail->ErrorInfo;
                    }

                } catch (Exception $ex){
                    $msg = $ex->getMessage();
                    die(json_encode(array($msg)));
                }

                die(json_encode(array('Yep', $msg)));


                break;
        }
    }

    if(isset($_GET['email']) && isset($_GET['token'])){
        if(!dbConnectionSuccessful($myLink, "dbBlogs")) die(json_encode(array('DB Connectivity Error!')));
        $email = $myLink->real_escape_string(sanitized($_GET['email']));
        $token = $myLink->real_escape_string(sanitized($_GET['token']));

        $qString = "select * from tblUsers where Email = '$email' AND Token = '$token';";
        $qResult = executeQuery($myLink, $qString);

        if($qResult->num_rows == 1){
            $qStr = "update tblUsers set EmailConfirmed = 1 where Token = '$token';";
            $qRes = executeQuery($myLink, $qStr);

            header("Location: http://localhost/tebsgroup/blogs/studioblog.html?token=$token");
            exit();
        }
    }


    function getAllPosts(&$aLink){
        $qString = "select * from tblStudioBlogPosts;";
        $qResult = executeQuery($aLink, $qString);

        $arrStudioPosts = array();
        while($row = $qResult->fetch_assoc()){
            $arrStudioPosts[] = $row;
        }

        return $arrStudioPosts;
    }

    function getPostComments(&$aLink, $postID){
        $qString = "select * from tblStudioBlogComments where PostID = $postID ORDER BY MotherCommentID, PostTime;";
        $qResult = executeQuery($aLink, $qString);

        $arrStudioBlogComments = array();
        while($row = $qResult->fetch_assoc()){
            $arrStudioBlogComments[] = $row;
        }

        return $arrStudioBlogComments;
    }

    function getMediaList(&$aLink){
        $qString = "select * from tblMediaList order by Filename;";
        $qResult = executeQuery($aLink, $qString);

        $uploadDirectory = $_SERVER['DOCUMENT_ROOT'].'/tebsgroup/blogs/';
        $arrMediaList = array();
        while($row = $qResult->fetch_assoc()){
            if(file_exists($uploadDirectory.$row['Path'])){
                $arrMediaList[] = $row;
            }
        }

        return $arrMediaList;
    }

    function dbConnectionSuccessful(&$aLink, $strDBname){
        $isConnectSuccessful = false;
        $aLink = new mysqli(myHost, myUser, myPass);                                //login and select db
        if($aLink && $aLink->select_db($strDBname)) $isConnectSuccessful = true;
        return $isConnectSuccessful;
    }

    function sanitized($data){
        $data = trim($data);
        $data = stripslashes($data);
        $data = htmlentities($data);

        return $data;
    }
    
    function queryForLogin(&$aLink, $qString){
        $qResult = executeQuery($aLink, $qString);
        $nRows = $qResult->num_rows;
        if($nRows > 0){
            $arrUserInfo = array();
            while ($row = $qResult->fetch_assoc()) {
                $arrUserInfo[] = $row;
            }
            //$Uid = $qResult->fetch_assoc()['id'];
            //$isAdmin = ($qResult->fetch_assoc()['IsAdmin'] == 1)? true: false;
            die(json_encode(array('PASS', json_encode($arrUserInfo))));
        } else {
            die(json_encode(array('FAIL', 'Wahla dey!')));
        }
    }

    function executeQuery(&$aLink, $queryString){
        $queryResult = $aLink->query($queryString);
        if(!$queryResult) die($aLink->error);

        return $queryResult;
    }
    
?>