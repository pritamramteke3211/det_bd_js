let video;
let bodyPose;
let poses = [];
let connections;

function preload() {
  // Load the bodyPose model
  bodyPose = ml5.bodyPose();
}

function setup() {
  let canvasWidth = windowWidth;
  let canvasHeight = windowHeight;

  // If it's a mobile device, adjust the canvas size to mobile dimensions
  if (isMobile()) {
    canvasWidth = window.innerWidth; // For mobile devices, use the inner width
    canvasHeight = window.innerHeight; // For mobile devices, use the inner height
  }

  createCanvas(canvasWidth, canvasHeight); // Create canvas based on dimensions

  // Create the video and hide it
  video = createCapture(VIDEO);
  video.size(canvasWidth, canvasHeight); // Adjust video size
  video.hide();

  // Start detecting poses in the webcam video
  bodyPose.detectStart(video, gotPoses);

  // Get the skeleton connection information
  connections = bodyPose.getSkeleton();
}

// Function to detect if the device is mobile
function isMobile() {
  return /Mobi|Android/i.test(navigator.userAgent);
}

function draw() {
  // Draw the webcam video
  image(video, 0, 0, width, height);

  // Draw the skeleton connections
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i];
    for (let j = 0; j < connections.length; j++) {
      let pointAIndex = connections[j][0];
      let pointBIndex = connections[j][1];
      let pointA = pose.keypoints[pointAIndex];
      let pointB = pose.keypoints[pointBIndex];
      // Only draw a line if both points are confident enough
      if (pointA.confidence > 0.1 && pointB.confidence > 0.1) {
        stroke(255, 0, 0);
        strokeWeight(2);
        line(pointA.x, pointA.y, pointB.x, pointB.y);
      }
    }
  }

  // Draw all the tracked landmark points
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i];
    for (let j = 0; j < pose.keypoints.length; j++) {
      let keypoint = pose.keypoints[j];
      // Only draw a circle if the keypoint's confidence is bigger than 0.1
      if (keypoint.confidence > 0.1) {
        fill(0, 255, 0);
        noStroke();
        circle(keypoint.x, keypoint.y, 10);
      }
    }
  }
}

let lastSentTime = 0;
const sendInterval = 100; // Send data every 100 ms

// Callback function for when bodyPose outputs data
function gotPoses(results) {
  const now = Date.now();
  if (now - lastSentTime > sendInterval) {
    lastSentTime = now;
    poses = results;
    // Send the pose data to React Native WebView
    window?.ReactNativeWebView?.postMessage(JSON.stringify(poses));
  }
}
