function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
    vars[key] = value;
  });
  return vars;
}

async function postData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *client
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  return await response.json(); // parses JSON response into native JavaScript objects
}



// Copyright (c) 2019 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
PoseNet using p5.js
=== */

var CUSTOM_CODE = getUrlVars()['code']

function updateCustomCodeDisplay() {
  document.getElementById('customCode').innerHTML = CUSTOM_CODE
}


// Grab elements, create settings, etc.
var video = document.getElementById('video');
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

// The detected positions will be inside an array
let poses = [];

// Create a webcam capture
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({
    video: true
  }).then(function(stream) {
    video.srcObject = stream;
    video.play();
  });
}

// A function to draw the video and poses into the canvas.
// This function is independent of the result of posenet
// This way the video will not seem slow if poseNet 
// is not detecting a position
function drawCameraIntoCanvas() {
  // Draw the video element into the canvas
  ctx.drawImage(video, 0, 0, 640, 480);
  // We can call both functions to draw all keypoints and the skeletons
  drawKeypoints();
  window.requestAnimationFrame(drawCameraIntoCanvas);
}
// Loop over the drawCameraIntoCanvas function
drawCameraIntoCanvas();

// Create a new poseNet method with a single detection
const poseNet = ml5.poseNet(video, modelReady);
poseNet.on('pose', gotPoses);

// A function that gets called every time there's an update from the model
function gotPoses(results) {
  poses = results;
}

function modelReady() {
  console.log("model ready")
  poseNet.multiPose(video)
}

function angleBetweenTwoPoints(a, b) {
  angleOfPoints = Math.atan((a.x - b.x) / (a.y - b.y)) * (180 / Math.PI) / 90;
  if (angleOfPoints > 0) {
    angleOfPoints = 1 - angleOfPoints
  } else {
    angleOfPoints = -1 * (1 + angleOfPoints)
  }
  angleOfPoints = (angleOfPoints) * 64 + 64
  return angleOfPoints
}

function angleBetweenThreePoints(A, B, C) {
  var AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
  var BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2));
  var AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2));
  return Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB)) * (180 / Math.PI) * (127 / 180.0);
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  console.log(poses)
  if (poses.length > 0) {
    pose = poses[0].pose;
    console.log(pose);
    angleOfHead = Math.round(angleBetweenTwoPoints(pose.rightEye, pose.leftEye))
    angleOfTorso = Math.round(angleBetweenTwoPoints(pose.rightShoulder, pose.leftShoulder))
    angleOfHips = Math.round(angleBetweenTwoPoints(pose.rightHip, pose.leftHip))
    rightArmRaised = Math.round(angleBetweenThreePoints(pose.rightWrist, pose.rightShoulder, pose.rightHip))
    leftArmRaised = Math.round(angleBetweenThreePoints(pose.leftWrist, pose.leftShoulder, pose.leftHip))
    rightArmOpen = Math.round(angleBetweenThreePoints(pose.rightWrist, pose.rightElbow, pose.rightShoulder))
    leftArmOpen = Math.round(angleBetweenThreePoints(pose.leftWrist, pose.leftElbow, pose.leftShoulder))
    rightKneeOpen = Math.round(angleBetweenThreePoints(pose.rightAnkle, pose.rightKnee, pose.rightHip))
    leftKneeOpen = Math.round(angleBetweenThreePoints(pose.leftAnkle, pose.leftKnee, pose.leftHip))
    rightLegRaised = Math.round(angleBetweenThreePoints(pose.rightAnkle, pose.rightHip, {'x':pose.rightHip.x, 'y':pose.rightHip.y+10}))
    leftLegRaised = Math.round(angleBetweenThreePoints(pose.leftAnkle, pose.leftHip, {'x':pose.leftHip.x, 'y':pose.leftHip.y+10}))
    pos = {
      angleOfHead,
      angleOfTorso,
      angleOfHips,
      leftArmRaised,
      rightArmRaised,
      rightArmOpen,
      leftArmOpen,
      rightKneeOpen,
      leftKneeOpen,
      rightLegRaised,
      leftLegRaised,
      raw: pose
    }
    postData('/dance', {
      id: CUSTOM_CODE,
      pos: pos
    })
    updateCustomCodeDisplay();
    // For each pose detected, loop through all the keypoints
    for (let j = 0; j < pose.keypoints.length; j++) {
      let keypoint = pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        RECTSIZE = 5
        ctx.strokeRect(keypoint.position.x - RECTSIZE, keypoint.position.y - RECTSIZE, RECTSIZE * 2, RECTSIZE * 2);
      }
    }
  }
}