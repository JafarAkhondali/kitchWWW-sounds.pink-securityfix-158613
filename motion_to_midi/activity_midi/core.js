var rectCounts = {}

var currMidiCC = 16
function nextMidiCC(){
    var maxSoFar = Math.max(...state.activitySending, ...state.xySending, 15)
    return maxSoFar+1
}

var state = {
    boxEnabled:[0],
    activitySending:[-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,15,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    xySending:      [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,16,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    height:4,
    width:5,
    debug:false,
    smoothing:3,
    mappings:{"1-2":60} // for boxes
}


var pointLabelsToDo = [
    "nose",
    "left ear", 
    "right ear", 
    "left shoulder", 
    "right shoulder", 
    "left elbow", 
    "right elbow", 
    "left wrist", 
    "right wrist", 
    "left hip", 
    "right hip", 
    "left knee", 
    "right knee", 
    "left ankle", 
    "right ankle", 
    ]


var soloedMidiCCLabel = ""

function updateDisplayWithState() {
    document.getElementById("debugOn").checked = state.debug
    document.getElementById("smoothingSlider").value = state.smoothing
    console.log(state.activitySending)
    for(var i = 0; i < allPoints.length;i++){
        if(pointLabelsToDo.includes(allPoints[i])){
            document.getElementById("checkbox"+i).checked = state.boxEnabled.includes(i)
            document.getElementById("checkboxActivity"+i).checked = state.activitySending[i]!=-1
            document.getElementById("checkboxXY"+i).checked = state.xySending[i]!=-1
            document.getElementById("checkboxXY"+(i+allPoints.length)).checked = state.xySending[i+allPoints.length]!=-1

        // and now do the boxvalues for all the Activity and XY things:
            if(state.activitySending[i] == -1){
                document.getElementById("midiCCactiity"+i).disabled = true
                document.getElementById("midiCCactiity"+i).value = ""
                document.getElementById('activitySolo'+i).style.display="none"
            }else{
                document.getElementById("midiCCactiity"+i).disabled = false
                document.getElementById("midiCCactiity"+i).value = state.activitySending[i]
                document.getElementById('activitySolo'+i).style.display="inline-block"
                if(soloedMidiCCLabel == 'activitySolo'+i){
                    document.getElementById('activitySolo'+i).style.backgroundColor="#CCCC00"
                }else{
                    document.getElementById('activitySolo'+i).style.backgroundColor="#555555"
                }
            }
            if(state.xySending[i] == -1){
                document.getElementById("midiCCxy"+i).disabled = true
                document.getElementById("midiCCxy"+i).value = ""
                document.getElementById('xySolo'+i).style.display="none"
            }else{
                document.getElementById("midiCCxy"+i).disabled = false
                document.getElementById("midiCCxy"+i).value = state.xySending[i]
                document.getElementById('xySolo'+i).style.display="inline-block"
                if(soloedMidiCCLabel == 'xySolo'+i){
                    document.getElementById('xySolo'+i).style.backgroundColor="#CCCC00"
                }else{
                    document.getElementById('xySolo'+i).style.backgroundColor="#555555"
                }

            }
            if(state.xySending[(i+allPoints.length)] == -1){
                document.getElementById("midiCCxy"+(i+allPoints.length)).disabled = true
                document.getElementById("midiCCxy"+(i+allPoints.length)).value = ""
                document.getElementById('xySolo'+(i+allPoints.length)).style.display="none"
            }else{
                document.getElementById("midiCCxy"+(i+allPoints.length)).disabled = false
                document.getElementById("midiCCxy"+(i+allPoints.length)).value = state.xySending[(i+allPoints.length)]
                document.getElementById('xySolo'+(i+allPoints.length)).style.display="inline-block"
                if(soloedMidiCCLabel == 'xySolo'+(i+allPoints.length)){
                    document.getElementById('xySolo'+(i+allPoints.length)).style.backgroundColor="#CCCC00"
                }else{
                    document.getElementById('xySolo'+(i+allPoints.length)).style.backgroundColor="#555555"
                }
            }
        }
    }
    document.getElementById("widthTextBox").value = state.width
    document.getElementById("heightTextBox").value = state.height
    drawActiveBoxes()
    for(var w = 0; w < state.width;w++ ){
        for(var h = 0; h < state.height;h++){
            var id = w+"-"+h
            document.getElementById("checkbox"+id).checked = id in state.mappings
            if(id in state.mappings){
                document.getElementById("midiNumb"+id).disabled = false
                document.getElementById("midiNumb"+id).value = state.mappings[id]                
            }else{
                document.getElementById("midiNumb"+id).value = ""
                document.getElementById("midiNumb"+id).disabled = true 
            }

        }
    }
}

function initState() {
    for(var i = 0; i < allPoints.length;i++){
        var iDiv = document.createElement('div');
        var myLabel = document.createElement('span');
        iDiv.id = 'activeMarkerDiv'+i;
        // iDiv.className = 'block';
        myLabel.innerHTML = " "+allPoints[i]
        var checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.myIndex = i
        checkbox.id = "checkbox"+i
        checkbox.addEventListener('change', (event) => {
            console.log(event.srcElement)
            console.log(event.srcElement.myIndex)
            var i = event.srcElement.myIndex
            if (event.currentTarget.checked) {
                console.log(i+' checked');
                if(!state.boxEnabled.includes(i)){
                    state.boxEnabled.push(i)
                }
            } else {
                console.log(i+' not checked');
                var index = state.boxEnabled.indexOf(i);
                if (index !== -1) {
                  state.boxEnabled.splice(index, 1);
              }
          }
          stateHasBeenUpdated()
      })
        iDiv.appendChild(checkbox)
        iDiv.appendChild(myLabel)
        if(pointLabelsToDo.includes(allPoints[i])){
            document.getElementById('bodyMarkerList').appendChild(iDiv);
        }



        // DO THE THING FOR ACTIVITY SENSOR

        var iDiv = document.createElement('div');
        var myLabel = document.createElement('span');
        iDiv.id = 'activeSensorBodyMarker'+i;
        myLabel.innerHTML = " "+allPoints[i]
        var checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.myIndex = i
        checkbox.id = "checkboxActivity"+i
        checkbox.addEventListener('change', (event) => {
            console.log(event.srcElement)
            console.log(event.srcElement.myIndex)
            var i = event.srcElement.myIndex
            if (event.currentTarget.checked) {
                console.log(i+' checked');
                state.activitySending[i] = nextMidiCC()
            } else {
                console.log(i+' not checked');
                state.activitySending[i] = -1
            }
            stateHasBeenUpdated()
        })


        var id = i
        console.log("id")
        var inputField = document.createElement("INPUT");
        inputField.setAttribute("type", "text");
        inputField.myIndex = id
        inputField.id="midiCCactiity"+id
        inputField.addEventListener('change', (event) => {
            var i = event.srcElement.myIndex
            var newVal = parseInt(event.srcElement.value)
            if(newVal > 128){
                newVal = nextMidiCC()
            }
            if(newVal < 0){
                newVal = nextMidiCC()
            }
            state.activitySending[i] = newVal
            stateHasBeenUpdated()
        })

        var mySolo = document.createElement('span');
        mySolo.classList.add("soloButton")
        mySolo.innerHTML = "solo"
        mySolo.id="activitySolo"+id
        mySolo.myIndex = id
        mySolo.addEventListener('click', (event) => {
            var i = event.srcElement.myIndex
            console.log("here!!!!!!!!!!")
            console.log(i)
            console.log(event.srcElement.id)
            console.log(soloedMidiCCLabel)
            if(soloedMidiCCLabel == event.srcElement.id){
                soloedMidiCCLabel = ""
            }else{
                soloedMidiCCLabel = event.srcElement.id
            }
            stateHasBeenUpdated()
        })

        iDiv.appendChild(checkbox)
        iDiv.appendChild(inputField)
        iDiv.appendChild(myLabel)
        iDiv.appendChild(mySolo)

        if(pointLabelsToDo.includes(allPoints[i])){
            document.getElementById('bodyMarkerListActivity').appendChild(iDiv);
        }


        for(var doingItTwice = 0; doingItTwice < 2; doingItTwice ++){

            var indexToUse = i + (doingItTwice * allPoints.length)
            var labToUse = doingItTwice == 0 ? "X" : "Y"

            // DO THE THING FOR X SENSOR
            var iDiv = document.createElement('div');
            var myLabel = document.createElement('span');

            var mySolo = document.createElement('span');
            mySolo.classList.add("soloButton")
            mySolo.innerHTML = "solo"
            mySolo.id="xySolo"+indexToUse
            mySolo.myIndex = indexToUse
            mySolo.addEventListener('click', (event) => {
                var i = event.srcElement.myIndex
                console.log("here!!!!!!!!!!")
                console.log(i)
                console.log(event.srcElement.id)
                console.log(soloedMidiCCLabel)
                if(soloedMidiCCLabel == event.srcElement.id){
                    soloedMidiCCLabel = ""
                }else{
                    soloedMidiCCLabel = event.srcElement.id
                }
                stateHasBeenUpdated()
            })
            
            iDiv.id = 'xySensorBodyMarker'+indexToUse;
            

            myLabel.innerHTML = " "+labToUse+" "+allPoints[i]
            var checkbox = document.createElement('input');
            checkbox.type = "checkbox";
            checkbox.myIndex = indexToUse
            checkbox.id = "checkboxXY"+indexToUse
            checkbox.addEventListener('change', (event) => {
                console.log(event.srcElement.myIndex)
                var i = event.srcElement.myIndex
                if (event.currentTarget.checked) {
                    console.log(i+' checked');
                    state.xySending[i] = nextMidiCC()
                } else {
                    console.log(i+' not checked');
                    state.xySending[i] = -1
                }
                stateHasBeenUpdated()
            })

            var inputField = document.createElement("INPUT");
            inputField.setAttribute("type", "text");
            inputField.myIndex = indexToUse
            inputField.id="midiCCxy"+indexToUse
            inputField.addEventListener('change', (event) => {
                var i = event.srcElement.myIndex
                var newVal = parseInt(event.srcElement.value)
                console.log(newVal)
                if(newVal > 128){
                    newVal = nextMidiCC()
                }
                if(newVal < 0){
                    newVal = nextMidiCC()
                }
                state.xySending[i] = newVal
                stateHasBeenUpdated()
            })
            iDiv.appendChild(checkbox)
            iDiv.appendChild(inputField)
            iDiv.appendChild(myLabel)
            iDiv.appendChild(mySolo)
            if(pointLabelsToDo.includes(allPoints[i])){
                document.getElementById('bodyMarkerListXY').appendChild(iDiv);
            }
        }
    }
}



function drawActiveBoxes(){
    document.getElementById('boxesList').innerHTML = ""
    for(var w = 0; w < state.width;w++ ){
        for(var h = 0; h < state.height;h++){
            var id = w+"-"+h
            var iDiv = document.createElement('div');
            var myLabel = document.createElement('span');
            myLabel.classList.add("labelArea")
            myLabel.innerHTML = id
            iDiv.id = 'box-'+id;

            var checkbox = document.createElement('input');
            checkbox.type = "checkbox";
            checkbox.myIndex = id
            checkbox.id = "checkbox"+id
            checkbox.addEventListener('change', (event) => {
                var id = event.srcElement.myIndex
                if(event.srcElement.checked){
                    state.mappings[id] = newCandidateNumber(id)
                }else{
                    delete state.mappings[id]
                }
                state.mappings[id]
                stateHasBeenUpdated()
            })

            var inputField = document.createElement("INPUT");
            inputField.setAttribute("type", "text");
            inputField.myIndex = id
            inputField.id="midiNumb"+id

            inputField.addEventListener('change', (event) => {

                var newVal = parseInt(event.srcElement.value)
                console.log(newVal)
                if(newVal > 128){
                    newVal = newCandidateNumber(id)
                }
                if(newVal < 0){
                    newVal = newCandidateNumber(id)
                }
                state.mappings[event.srcElement.myIndex] = newVal
                stateHasBeenUpdated()
            })
            iDiv.appendChild(checkbox)
            iDiv.appendChild(myLabel)
            iDiv.appendChild(inputField)
            document.getElementById('boxesList').appendChild(iDiv);
        }
    }
}

drawActiveBoxes()

function newCandidateNumber(id){
    var l = id.split("-")
    var w = parseInt(l[0])
    var h = parseInt(l[1])
    var startingPoint = 48
    if(state.width * state.height > 127-startingPoint){
        startingPoint = 127 - (state.width * state.height)
    }
    if(startingPoint < 0){
        startingPoint = 1
    }
    return startingPoint + (w * state.height) + h
}


function addToRectCount(point, newRectCounts){
    if(Object.keys(newRectCounts).length < state.width * state.height){
        for(var w = 0; w < state.width;w++ ){
            for(var h = 0; h < state.height;h++){
                newRectCounts[w+"-"+h] = 0
            }
        }
    }
    var w = Math.floor(point.x * state.width)
    var h = Math.floor(point.y * state.height)
    newRectCounts[w+"-"+h] += 1
}
var oldRectCounts = {}



function processRectCounts(newRectCounts){
    for(var w = 0; w < state.width;w++ ){
        for(var h = 0; h < state.height;h++){
            if((w+"-"+h in state.mappings)){
                if(newRectCounts[w+"-"+h] > 0 && oldRectCounts[w+"-"+h] == 0){
                    // send a note on!!!!
                    sendNoteOn(w+"-"+h)
                }
                if(newRectCounts[w+"-"+h] == 0 && oldRectCounts[w+"-"+h] > 0){
                    // send a note off!!!!
                    sendNoteOff(w+"-"+h)
                }
            }
        }
    }
    return newRectCounts
}

document.getElementById("heightTextBox").onchange = (event) => {
    state.height = keepValid(parseInt(event.currentTarget.value),1,20,4)
    stateHasBeenUpdated()
}
document.getElementById("widthTextBox").onchange = (event) => {
    state.width = keepValid(parseInt(event.currentTarget.value),1,20,5)
    stateHasBeenUpdated()
}

function sendNoteOn(id) {
    sendToMidi([0x90, state.mappings[id], 0x7f])
}
function sendNoteOff(id){
    sendToMidi([0x80, state.mappings[id], 0])
}
function sendMidiCC(ccChan, val){
    var chanToSolo = -1
    if(soloedMidiCCLabel!=""){
        var solospan = document.getElementById(soloedMidiCCLabel)
        if(solospan.id.includes("xy")){
                // we do xy stuff to solo
            chanToSolo = document.getElementById("midiCCxy"+solospan.myIndex).value
        }else{
                // we do activity stuff
            chanToSolo = document.getElementById("midiCCactiity"+solospan.myIndex).value
        }
    }
        // we DO want to do rounding for free.
        // we DON'T want to do minmaxing without alerting.
    var valToCheck = Math.round(val) 
    var valToSend = Math.min(Math.max(valToCheck,0),126)
    if(valToCheck != valToSend){
        console.log("ERROR: "+val+" != "+valToSend)
    }
    if(chanToSolo == -1 || ccChan == chanToSolo){
        sendToMidi([0xB0, ccChan, valToSend])    
    }
}


var prevlandmarks = null

function doWholeSpecificFunction(result){
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    for(var w = 0; w < state.width;w++ ){
        for(var h = 0; h < state.height;h++){
            canvasCtx.beginPath();
            var wunit = canvasElement.width / state.width
            var hunit = canvasElement.height / state.height
            if(state.debug){
                canvasCtx.lineWidth = 3;
                canvasCtx.strokeStyle = "black";
                canvasCtx.fillStyle = "rgba(0, 0, 200, 0)";
                canvasCtx.strokeRect(w*wunit, h*hunit, wunit, hunit);
                if(w+"-"+h in state.mappings){
                    canvasCtx.fillStyle = "rgba(0, 0, 200, 0.1)";
                    canvasCtx.rect(w*wunit, h*hunit, wunit, hunit);
                    canvasCtx.fill();
                }
            }
            if(oldRectCounts[w+"-"+h] > 0 && w+"-"+h in state.mappings){
                canvasCtx.fillStyle = "rgba(0, 250, 0, 0.2)";
                canvasCtx.rect(w*wunit, h*hunit, wunit, hunit);
                canvasCtx.fill();
            }
        }
    }
    canvasCtx.lineWidth = 3;
    canvasCtx.strokeStyle = "black";

    var newRectCounts = {}
    if(result.landmarks.length > 0){
        foundSomething()
        var landmark = result.landmarks[0]
        if(prevlandmarks == null){
            prevlandmarks = []
            for(var i = 0; i < 15; i++){
                prevlandmarks.push(JSON.parse(JSON.stringify(landmark)))
            }
        }
        landmark = smoothLandmark(landmark)
        var wayPrevLandmark = prevlandmarks.shift()

        for(var i = 0; i < allPoints.length; i++){
            if(pointLabelsToDo.includes(allPoints[i])){
                var px1 = normalizedToPixelCoordinates(
                    landmark[i].x,
                    landmark[i].y,
                    canvasElement.width,
                    canvasElement.height)

                var dx = (landmark[i].x - wayPrevLandmark[i].x)
                var dy = (landmark[i].y - wayPrevLandmark[i].y)
                var totalActivity = (dx*dx)+(dy*dy)

                if(state.activitySending[i]!=-1){
                    sendMidiCC(state.activitySending[i],Math.round(totalActivity * 300))
                    canvasCtx.lineWidth = 0;
                    canvasCtx.strokeStyle = "black";
                    canvasCtx.beginPath();
                    canvasCtx.arc(px1[0], px1[1], Math.round(totalActivity * 400), 0, 2 * Math.PI);
                    canvasCtx.fillStyle = "rgba(200, 0, 200, 0.2)";
                    if(state.debug){
                        canvasCtx.stroke();
                    }
                    canvasCtx.fill();

                    canvasCtx.beginPath();
                    canvasCtx.arc(px1[0], px1[1], 6, 0, 2 * Math.PI);
                    canvasCtx.lineWidth = 2;
                    canvasCtx.strokeStyle="rgba(0, 0, 0, 0.3)"
                    canvasCtx.stroke()
                }

                var widthOfCross = 50;
                if(state.xySending[i]!=-1){ // doing X
                    sendMidiCC(state.xySending[i],127 - (px1[0]*126 / canvasElement.width))
                    canvasCtx.beginPath();    
                    if(state.debug){
                        canvasCtx.lineWidth = 4;
                        canvasCtx.strokeStyle="rgba(0, 0, 0, 1)"
                    }else{
                        canvasCtx.lineWidth = 2;
                        canvasCtx.strokeStyle="rgba(0, 0, 0, 0.3)"
                    }
                    canvasCtx.moveTo(px1[0],px1[1]-widthOfCross)
                    canvasCtx.lineTo(px1[0],px1[1]+widthOfCross)
                    canvasCtx.stroke()
                }
                if(state.xySending[i + (allPoints.length)]!=-1){ // doing Y
                    sendMidiCC(state.xySending[i + allPoints.length], 127 - (px1[1]*126 / canvasElement.height))
                    canvasCtx.beginPath();  
                    if(state.debug){
                        canvasCtx.lineWidth = 4;
                        canvasCtx.strokeStyle="rgba(0, 0, 0, 1)"
                    }else{
                        canvasCtx.lineWidth = 2;
                        canvasCtx.strokeStyle="rgba(0, 0, 0, 0.3)"
                    }
                    canvasCtx.moveTo(px1[0]-widthOfCross, px1[1])
                    canvasCtx.lineTo(px1[0]+widthOfCross, px1[1])
                    canvasCtx.stroke()
                }

                if(state.boxEnabled.includes(i)){
                    canvasCtx.beginPath();    
                    canvasCtx.rect(px1[0]-10, px1[1]-10, 20, 20);
                    canvasCtx.fillStyle = "rgba(0,0,0,.5)";
                    canvasCtx.fill()
                }
                if(state.boxEnabled.includes(i)){
                    addToRectCount(landmark[i], newRectCounts)
                }

                if(state.debug){
                    canvasCtx.beginPath();    
                    canvasCtx.strokeStyle = "black"
                    canvasCtx.strokeRect(px1[0]-10, px1[1]-10, 20, 20);
                    canvasCtx.fill();
                }

            }

        }
        prevlandmarks.push(JSON.parse(JSON.stringify(landmark))); 

        if(state.debug){
            console.log(newRectCounts)
        }
        oldRectCounts = processRectCounts(newRectCounts)
    }
    canvasCtx.restore();
}

function clearEverything(){
    for(var i = 0; i < 40;i++){
        sendMidiCC(14+i,0)
        prevlandmarks = null
    }

    var emptyRectCounts = {}
    for (const [key, value] of Object.entries(oldRectCounts)) {
      emptyRectCounts[key] = 0
  }
  processRectCounts(emptyRectCounts)
  oldRectCounts = emptyRectCounts
}




























































// ========================== LIBRARY BELOW ============================




function foundSomething(){
    nothingOnce = false
    nothingTwice = false
    nothingThreetimes = false
}

var nothingOnce = false
var nothingTwice = false // after this, clear things.
var nothingThreetimes = false // to tell if we've already cleared things.

function checkForNothing(){
    if(state.debug){
        console.log("checking for nothing")
    }
    if(nothingOnce == false){
        nothingOnce = true
        nothingTwice = false
        return
    }
    if(nothingOnce == true){
        if(nothingTwice == false){
            nothingTwice = true
            return
        }
        if(nothingTwice == true){
            if(nothingThreetimes == false){
                clearEverything()    
                nothingThreetimes = true
            }
        }
    }
}
setInterval(checkForNothing, 300)

async function doCameraFirst() {
    console.log("hello?")
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');

        const cameraSelect = document.getElementById('cameraSelect');
        videoDevices.forEach(device => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.text = device.label || `Camera ${cameraSelect.length + 1}`;
            cameraSelect.appendChild(option);
        });

        cameraSelect.addEventListener('change', () => {
            const selectedDeviceId = cameraSelect.value;
            setCamera(selectedDeviceId);
        });

        if (videoDevices.length > 0) {
            setCamera(videoDevices[0].deviceId);
        }
    } catch (error) {
        console.error('Error accessing media devices.', error);
    }
}

async function setCamera(deviceId) {
    try {
        webcamRunning = false
        const constraints = {
            video: { deviceId: { exact: deviceId } }
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const videoElement = document.getElementById('webcam');
        videoElement.srcObject = stream;
        webcamRunning = true
    } catch (error) {
        console.error('Error setting camera.', error);
    }
}


function openFullscreen(elem) {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { /* Safari */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE11 */
    elem.msRequestFullscreen();
}
}

function fullscreen(){
    openFullscreen(document.getElementById("wholeThingMaybe"))
}

let midiOutput = null;

function enableMidiStuff(){
    if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess({ sysex: true })
        .then(onMIDISuccess, onMIDIFailure);
    } else {
        console.error('Web MIDI API not supported in this browser.');
    }
}

function onMIDISuccess(midiAccess) {
    const midiOutputDevicesSelect = document.getElementById('midiOutputDevices');
    const outputs = midiAccess.outputs.values();
    var midiOutsAdded = 0
    for (let output of outputs) {
        const option = document.createElement('option');
        option.value = output.id;
        option.text = output.name;
        midiOutputDevicesSelect.appendChild(option);
        midiOutsAdded+=1
    }

    if(midiOutsAdded == 0){
        document.getElementById("midiError").style.display="block"
    }

    midiOutputDevicesSelect.addEventListener('change', (event) => {
        midiOutput = midiAccess.outputs.get(event.target.value);
    });

    // Automatically select the first output device
    if (midiOutputDevicesSelect.options.length > 0) {
        midiOutputDevicesSelect.selectedIndex = 0;
        midiOutput = midiAccess.outputs.get(midiOutputDevicesSelect.value);
    }
}

function onMIDIFailure() {
    console.error('Could not access MIDI devices.');
}

function sendToMidi(command) {
    if(state.debug){
        console.log("sending Midi!")
    }
    if (midiOutput) {
        midiOutput.send(command);
    } else {
        // console.error('No MIDI output device selected.');
    }
}



function calculateAverage(arr) {
    if (arr.length === 0) return 0;

    let sum = arr.reduce((accumulator, current) => accumulator + current, 0);
    return sum / arr.length;
}


var allSmoothing = {}

function smoothWithMap(name, val){
    if(!(name in allSmoothing)){
        allSmoothing[name] = []
    }
    allSmoothing[name].push(val)
    while(allSmoothing[name].length > state.smoothing){
        allSmoothing[name].shift()
    }
    return calculateAverage(allSmoothing[name])
}

function capZeroOne(numb){
    return Math.min(Math.max(numb,0),1)
}

function smoothLandmark(landmark){
    var ret = []
    for(var i = 0; i < landmark.length; i++){
        ret.push({})
        ret[i].x = smoothWithMap("p"+i+"-x", capZeroOne(landmark[i].x))
        ret[i].y = smoothWithMap("p"+i+"-y", capZeroOne(landmark[i].y))
        ret[i].z = smoothWithMap("p"+i+"-z", capZeroOne(landmark[i].z))
    }
    return ret
}


function pointInRect(pt, rect) { // where rect is x,y,width,height
  if (pt.x >= rect[0] && pt.x <= rect[0] + rect[2] && pt.y >= rect[1] && pt.y <= rect[1] + rect[3]) {
    return true
}
return false
}


function normalizedToPixelCoordinates(normalized_x, normalized_y, image_width, image_height) {
  // Checks if the float value is between 0 and 1.
  function isValidNormalizedValue(value) {
    return (value > 0 || Math.abs(0 - value) < Number.EPSILON) && (value < 1 || Math.abs(1 - value) < Number.EPSILON);
}
var x_px = Math.min(Math.floor(normalized_x * image_width), image_width - 1);
var y_px = Math.min(Math.floor(normalized_y * image_height), image_height - 1);
return [x_px, y_px];
}

function getQueryParams(qs) {
    qs = qs.split('+').join(' ');
    var params = {},
    tokens,
    re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    return params;
}


function dataToQueryString(data){
    var encoded = [];

    for(var key in data){
        // skip prototype properties
        if(!data.hasOwnProperty(key)) continue;

        // encode string properly to use in url
        encoded.push(key + '=' + encodeURIComponent(data[key]));
    }
    return '?' + encoded.join('&');
}

function getStateFromURL(){
    try{
        var query = getQueryParams(document.location.search);
        var newState = JSON.parse(query.s)        
        state = newState
    }catch(e){
        console.log("error parsing state!")
        pushStateToURL()
    }
}

function pushStateToURL(){
    var s = {
        s:JSON.stringify(state)
    }
    var res = dataToQueryString(s)
    // console.log(res)
    window.history.pushState("object or string", "Title", "/activity_midi/index.html"+res);
}

// pushStateToURL()

getStateFromURL()

// now set up things for the given state


// var totalRects = state.width * state.height

var allPoints = [
    "nose", 
    "left eye (inner)", 
    "left eye", 
    "left eye (outer)", 
    "right eye (inner)", 
    "right eye", 
    "right eye (outer)", 
    "left ear", 
    "right ear", 
    "mouth (left)", 
    "mouth (right)", 
    "left shoulder", 
    "right shoulder", 
    "left elbow", 
    "right elbow", 
    "left wrist", 
    "right wrist", 
    "left pinky", 
    "right pinky", 
    "left index", 
    "right index", 
    "left thumb", 
    "right thumb", 
    "left hip", 
    "right hip", 
    "left knee", 
    "right knee", 
    "left ankle", 
    "right ankle", 
    "left heel", 
    "right heel", 
    "left foot index", 
    "right foot index"
    ]

function stateHasBeenUpdated(){
    pushStateToURL()
    updateDisplayWithState()
}


initState();
updateDisplayWithState()











// Copyright 2023 The MediaPipe Authors.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import { PoseLandmarker, FilesetResolver, DrawingUtils } from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";
let poseLandmarker = undefined;
let runningMode = "IMAGE";
let enableWebcamButton;
let webcamRunning = false;
const videoHeight = "360px";
const videoWidth = "480px";
// Before we can use PoseLandmarker class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
const createPoseLandmarker = async () => {
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
            delegate: "GPU"
        },
        runningMode: runningMode,
        numPoses: 2
    });
};
createPoseLandmarker();



const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
const drawingUtils = new DrawingUtils(canvasCtx);
// Check if webcam access is supported.
const hasGetUserMedia = () => { var _a; return !!((_a = navigator.mediaDevices) === null || _a === void 0 ? void 0 : _a.getUserMedia); };
// If webcam supported, add event listener to button for when user
// wants to activate it.
if (hasGetUserMedia()) {
    enableWebcamButton = document.getElementById("webcamButton");
    enableWebcamButton.addEventListener("click", enableCam);
}
else {
    console.warn("getUserMedia() is not supported by your browser");
}
// Enable the live webcam view and start detection.
function enableCam(event) {
    console.log("hi?")
    doCameraFirst()
    console.log("hi? again")
    if (!poseLandmarker) {
        console.log("Wait! poseLandmaker not loaded yet.");
        return;
    }
    if (webcamRunning === true) {
        webcamRunning = false;
        enableWebcamButton.innerText = "ENABLE PREDICTIONS";
    }
    else {
        webcamRunning = true;
        enableWebcamButton.innerText = "DISABLE PREDICTIONS";
        enableWebcamButton.style.display = "none"
        document.getElementById("cameraSelect").style.display="block"
    }
    // getUsermedia parameters.
    const constraints = {
        video: true
    };
    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        video.srcObject = stream;
        video.addEventListener("loadeddata", predictWebcam);
    });
}
let lastVideoTime = -1;


async function predictWebcam() {
    var idealWidth = document.getElementById("col1").clientWidth
    var idealHeight = idealWidth * (360 / 480)

    idealHeight = idealHeight+"px"
    idealWidth = idealWidth+"px"

    canvasElement.style.height = idealHeight // videoHeight;
    video.style.height = idealHeight // videoHeight;
    canvasElement.style.width =idealWidth // videoWidth;
    video.style.width = idealWidth // videoWidth;
    // Now let's start detecting the stream.
    if (runningMode === "IMAGE") {
        runningMode = "VIDEO";
        await poseLandmarker.setOptions({ runningMode: "VIDEO" });
    }
    let startTimeMs = performance.now();
    if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
            doWholeSpecificFunction(result);
        });
    }
    // Call this function again to keep predicting when the browser is ready.
    if (webcamRunning === true) {
        window.requestAnimationFrame(predictWebcam);
    }
}


document.getElementById("debugOn").onchange = (event) => {
    state.debug = event.currentTarget.checked
    stateHasBeenUpdated()
}

document.getElementById("smoothingSlider").onchange = (event) => {
    state.smoothing = parseInt(event.currentTarget.value)
    stateHasBeenUpdated()
}


// document.getElementById("fullscreenButton").onclick = (event) => {
//     fullscreen()
// }

document.getElementById("enableMidi").onclick = (event) => {
    enableMidiStuff()
    document.getElementById("enableMidi").style.display = "none"
    document.getElementById("midiOutputDevices").style.display = "inline-block"
}

function keepValid(x,low,high,pref) {
    if(x < low){
        return low
    }
    if(x> high){
        return high
    }
    return x
}

var isDivHidden = {
    "spatialBoxesContent":false,
    "activityContent":false,
    "xyContext":false,
}

document.getElementById("spatialBoxesContentShowHide").onclick = function(){showHide("spatialBoxesContent")}
document.getElementById("activityContentShowHide").onclick = function(){showHide("activityContent")}
document.getElementById("xyContextShowHide").onclick = function(){showHide("xyContext")}

function showHide(divName){
    if(isDivHidden[divName]){
        document.getElementById(divName).style.display = "block"
        document.getElementById(divName+"ShowHide").innerHTML = "hide"
        isDivHidden[divName] = false
    }else{
        document.getElementById(divName).style.display = "none"
        document.getElementById(divName+"ShowHide").innerHTML = "show"
        isDivHidden[divName] = true
    }
}