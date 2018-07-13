

$(document).ready(function(){	
	
    $("a[id*=anc]").click(function(e){
        writeContent(e);
    });
	
    //doInitialDownload();
});

function writeContent(e){

    var ctrID = (e.target)? e.currentTarget.id: e.srcElement.id;
    var strTextToWrite;
    var dumpSiteID;
    var imageFileName;
    var blnStudioBlog = false;
    var blnMediaBlog = false;
    var blnSoftwareBlog = false;

    switch(ctrID){
        case "ancStudioConsult":
            strTextToWrite = "Consult us: Tebs Studios!";
            dumpSiteID = "studioDepot";
            break;
        case "ancStudioMusic":
            strTextToWrite = "Tebs Music...!";
            dumpSiteID = "studioDepot";
            break;
        case "ancStudioVideo":
            strTextToWrite = "Tebs Music Video...!";
            dumpSiteID = "studioDepot";
            break;
        case "ancStudioMovie":
            strTextToWrite = "Tebs Music Movie...!";
            dumpSiteID = "studioDepot";
            break;
        case "ancStudioVoice":
            strTextToWrite = "Tebs Voice Training...!";
            dumpSiteID = "studioDepot";
            break;            
        case "ancStudioInstrument":
            strTextToWrite = "Tebs Instrumental Training...!";
            dumpSiteID = "studioDepot";
            break;
        case "ancStudioBlog":
            blnStudioBlog = true;
            break; 
        case "ancMediaConsult":
            strTextToWrite = "Consult Tebs Media...!";
            dumpSiteID = "mediaDepot";
            break; 
        case "ancMediaSound":
            strTextToWrite = "Tebs Media Sound...!";
            dumpSiteID = "mediaDepot";
            break;
        case "ancMediaDJ":
            strTextToWrite = "Tebs Media Gospel DJ...!";
            dumpSiteID = "mediaDepot";
            imageFileName = "tebs-media.jpg";
            break;       
        case "ancMediaLight":
            strTextToWrite = "Tebs Media Stage Lightings...!";
            dumpSiteID = "mediaDepot";
            break;     
        case "ancMediaEffects":
            strTextToWrite = "Tebs Media Light Effects...!";
            dumpSiteID = "mediaDepot";
            break; 
        case "ancMediaRadio":
            strTextToWrite = "Tebs Media Gospel Radio...!";
            dumpSiteID = "mediaDepot";
            break;  
        case "ancMediaTV":
            strTextToWrite = "Tebs Media Gospel TV...!";
            dumpSiteID = "mediaDepot";
            break;      
        case "ancMediaGingles":
            strTextToWrite = "Tebs Media Gospel Gingles...!";
            dumpSiteID = "mediaDepot";
            break;      
        case "ancMediaMessages":
            strTextToWrite = "Tebs Media Gospel Messages...!";
            dumpSiteID = "mediaDepot";
            break;         
        case "ancMediaBook":
            strTextToWrite = "Tebs Media Audio Books...!";
            dumpSiteID = "mediaDepot";
            break;         
        case "ancMediaGraphics":
            strTextToWrite = "Tebs Media Graphics...!";
            dumpSiteID = "mediaDepot";
            break;     
        case "ancMediaPublication":
            strTextToWrite = "Tebs Media Publications...!";
            dumpSiteID = "mediaDepot";
            break;
        case "ancMediaBlog":
            blnMediaBlog = true;
            break; 
        case "ancSoftwareConsult":
            strTextToWrite = "Tebs Software Engineering Consultation...!";
            dumpSiteID = "softwareDepot";
            break;
        case "ancSoftwareDB":
            strTextToWrite = "Tebs Software: Database technologies...!";
            dumpSiteID = "softwareDepot";
            break;
        case "ancSoftwareMedia":
            strTextToWrite = "Tebs Software Media...!";
            dumpSiteID = "softwareDepot";
            break;
        case "ancSoftwareWeb":
            strTextToWrite = "Tebs Software: Web technologies...!";
            dumpSiteID = "softwareDepot";
            break;
        case "ancSoftwareSecurity":
            strTextToWrite = "Tebs Software: Web Security...!";
            dumpSiteID = "softwareDepot";
            break;
        case "ancSoftwareDbAdmin":
            strTextToWrite = "Tebs Software: Database Administration...!";
            dumpSiteID = "softwareDepot";
            break;
        case "ancSoftwareAI":
            strTextToWrite = "Tebs Software: Artificial Intelligence...!";
            dumpSiteID = "softwareDepot";
            break;   
        case "ancSoftwareAndroid":
            strTextToWrite = "Tebs Mobile: Android...!";
            dumpSiteID = "softwareDepot";
            break;
        case "ancSoftwareIOS":
            strTextToWrite = "Tebs Mobile: iOS...!";
            dumpSiteID = "softwareDepot";
            break;         
        case "ancSoftwareBB":
            strTextToWrite = "Tebs Mobile: Blackberry...!";
            dumpSiteID = "softwareDepot";
            break;
        case "ancSoftwareJava":
            strTextToWrite = "Tebs Programming: Java...!";
            dumpSiteID = "softwareDepot";
            break;
        case "ancSoftwareC":
            strTextToWrite = "Tebs Programming: C...!";
            dumpSiteID = "softwareDepot";
            break;
        case "ancSoftwareCpp":
            strTextToWrite = "Tebs Programming: C++...!";
            dumpSiteID = "softwareDepot";
            break;
        case "ancSoftwareCsp":
            strTextToWrite = "Tebs Programming: C#...!";
            dumpSiteID = "softwareDepot";
            break;
        case "ancSoftwareVB":
            strTextToWrite = "Tebs Programming: VB.Net ...!";
            dumpSiteID = "softwareDepot";
            break;
        case "ancSoftwarePython":
            strTextToWrite = "Tebs Programming: Python...!";
            dumpSiteID = "softwareDepot";
            break;
        case "ancSoftwareBlog":
            blnSoftwareBlog = true;
            break;
        default:
            break;
    }

    if(!(blnMediaBlog || blnStudioBlog || blnSoftwareBlog)){
        //imageHolderID = (ctrID.indexOf("Studio") > -1)? ("imgStudios"):((ctrID.indexOf("Media") > -1)? ("imgMedia"): ("imgSoftware"));
        $("#" + dumpSiteID).html(strTextToWrite);
    } else {
        if(blnStudioBlog){
            window.open('blogs/studioblog.html', '_blank');
            blnStudioBlog = false;
        }

        if(blnMediaBlog){
            window.open('blogs/mediablog.html','_blank');
            blnMediaBlog = false;
        }

        if(blnSoftwareBlog){
            window.open('blogs/softwareblog.html','_blank');
        }

    }
}

