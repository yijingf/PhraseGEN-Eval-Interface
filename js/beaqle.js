/*
    BeaqleJS - HTML5 and JavaScript framework for listening tests
    Copyright (C) 2011-2014  Sebastian Kraft

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>
*/

// Enable JavaScript strict mode
"use strict";

// some linter configs
/*jshint browser: true */
/*jshint devel: true */
/*globals $:false */

// ###################################################################
// Audio pool object. Creates and manages a set of <audio> tags.

const baseDelay = 3; // 3 seconds

function playSampleAudio() {
    var x = document.getElementById("myAudio");
    x.play();
}

function pauseSampleAudio() {
    var x = document.getElementById("myAudio");
    x.pause();
}

// constructor
var AudioPool = function (PoolID) {
    this.NumPlayers = 0;
    this.NumUsed = 0;
    this.LoopAudio = 0;
    this.LoopFade = false;
    this.PoolID = PoolID;
    this.IDPlaying = -1;
    this.fadeInTime = 0.03;
    this.fadeOutTime = 0.01;
    this.fadeDelay = 0.01;
    this.lastAudioPosition = 0;
    this.positionUpdateInterval = 0.005;


    // web audio is only supported for same origin
    switch (window.location.protocol) {
        case 'http:':
        case 'https:':
            // check web audio support
            try {
                var genContextClass = (window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext || window.msAudioContext);
                this.waContext = new genContextClass();
                this.gainNodes = new Array();
            } catch (e) {
                // API not supported
                this.waContext = false;
            }
            break;
        case 'file:':
            this.waContext = false;
            break;
    }
    // IE does not support the WebAudioAPI
    if (clientIsIE() || clientIsSafari())
        this.waContext = false;

    // Firefox needs a longer delay before we start a fading curve,
    // otherwise the fading is not recognized
    if (clientIsFirefox())
        this.fadeDelay = 0.05;

    // set to false to manually disable WebAudioAPI support
    //this.waContext = false;

    // setup regular callback timer to check current playback position
    var _this = this;
    setInterval(this.loopCallback, this.positionUpdateInterval * 1000, _this);

}

// insert audio pool into DOM
AudioPool.prototype.register = function () {
    $('<div id="' + this.PoolID + '"></div>').appendTo('body');
}

// callback for timeUpdate event
AudioPool.prototype.loopCallback = function (_this) {

    if (_this.IDPlaying !== -1) {

        var audiotag = $('#' + _this.PoolID + ' > #audio' + _this.IDPlaying).get(0);

        // calculate progress including a look ahead for fade out or loop
        var progress = 0;
        progress = (audiotag.currentTime + _this.positionUpdateInterval + _this.fadeOutTime * 2) / audiotag.duration * 100.0;

        // if end is reached ...
        if ((progress >= 100) && (!_this.LoopFade)) {
            if (_this.LoopAudio == true) {
                _this.loopReturn();
            } else {
                _this.pause();
            }
        }
    }
}

// ---------------------------------------------------------
// overwrite these callbacks events after instantiation

// callback for time update event
AudioPool.prototype.onTimeUpdate = function (e) { }

// callback for error event
AudioPool.prototype.onError = function (e) { }

// callback for error event
AudioPool.prototype.onDataLoaded = function (e) { }
// ---------------------------------------------------------


// clear all files
AudioPool.prototype.clear = function () {
    if (this.waContext !== false) {
        this.gainNodes = new Array();
        // maybe we also have to remove the connections?!
    }

    if (clientIsChrome()) {
        //fixes bug in chromium. Otherwise old connections are not freed and maximum number of connections is reached soon
        //https://code.google.com/p/chromium/issues/detail?id=234779
        $('#' + this.PoolID + ' >.audiotags').prop('src', false);
    }

    $('#' + this.PoolID + ' >.audiotags').remove();
}

// add new file to pool
AudioPool.prototype.addAudio = function (path, ID) {
    var audiotag = document.createElement("audio");

    audiotag.setAttribute('src', path);
    audiotag.setAttribute('class', 'audiotags');
    audiotag.setAttribute('id', "audio" + ID)

    if (this.waContext !== false) {
        var gainNode = this.waContext.createGain();
        var source = this.waContext.createMediaElementSource(audiotag);
        source.connect(gainNode);
        gainNode.connect(this.waContext.destination);
        gainNode.gain.value = 0.0000001;  // fixes https://bugzilla.mozilla.org/show_bug.cgi?id=1213313
        gainNode.gain.setValueAtTime(0.0000001, this.waContext.currentTime);
        this.gainNodes[ID] = gainNode;
    }

    $(audiotag).off();

    // external event handlers
    $(audiotag).on("timeupdate", this.onTimeUpdate);
    $(audiotag).on("loadeddata", this.onDataLoaded);
    $(audiotag).on("error", this.onError);

    $('#' + this.PoolID).append(audiotag);

    if (!clientIsChrome()) {
        audiotag.setAttribute('preload', 'auto');
    } else {
        //preload=none fixes bug in chromium. Otherwise old connections are not freed and maximum number of connections is reached soon
        //https://code.google.com/p/chromium/issues/detail?id=234779
        audiotag.setAttribute('preload', 'none');
        audiotag.load();
    }
}

// play audio with specified ID
AudioPool.prototype.play = function (ID) {
    var audiotag = $('#' + this.PoolID + ' > #audio' + ID).get(0);
    audiotag.currentTime = 0.000001;

    if (this.waContext !== false) {
        var loopLen = audiotag.duration;
        if (loopLen > this.fadeOutTime * 2 + this.positionUpdateInterval * 2) {
            this.gainNodes[ID].gain.cancelScheduledValues(this.waContext.currentTime);
            this.gainNodes[ID].gain.value = 0.0000001;  // fixes https://bugzilla.mozilla.org/show_bug.cgi?id=1213313
            this.gainNodes[ID].gain.setValueAtTime(0.0000001, this.waContext.currentTime);
            this.gainNodes[ID].gain.setTargetAtTime(1.0, this.waContext.currentTime + this.fadeDelay, this.fadeInTime);
            this.LoopFade = false;
            audiotag.play();
        }
    } else {
        audiotag.play();
    }

    this.IDPlaying = ID;
}

// return to loop begin
AudioPool.prototype.loopReturn = function () {

    if (this.waContext !== false) {
        // fade out
        this.gainNodes[this.IDPlaying].gain.cancelScheduledValues(this.waContext.currentTime);
        this.gainNodes[this.IDPlaying].gain.setTargetAtTime(0.0, this.waContext.currentTime + this.fadeDelay, this.fadeOutTime);
        this.LoopFade = true;

        var audiotag = $('#' + this.PoolID + ' > #audio' + this.IDPlaying).get(0);
        var currID = this.IDPlaying;
        var _this = this;
        // wait till fade out is done
        setTimeout(function () {
            _this.LoopFade = false;
            audiotag.currentTime = 0.000001;
            _this.gainNodes[_this.IDPlaying].gain.cancelScheduledValues(_this.waContext.currentTime);
            _this.gainNodes[_this.IDPlaying].gain.setTargetAtTime(1.0, _this.waContext.currentTime + _this.fadeDelay, _this.fadeInTime);
        },
            (_this.fadeOutTime * 2.0 + _this.fadeDelay) * 1000.0 + 5.0
        );
    } else {
        // return to the start marker
        var audiotag = $('#' + this.PoolID + ' > #audio' + this.IDPlaying).get(0);
        audiotag.currentTime = 0.000001;
        audiotag.play();
    }
}

// pause currently playing audio
AudioPool.prototype.pause = function () {

    if (this.IDPlaying !== -1) {

        var audiotag = $('#' + this.PoolID + ' > #audio' + this.IDPlaying).get(0);
        this.lastAudioPosition = audiotag.currentTime;
        if ((this.waContext !== false) && (!audiotag.paused)) {
            this.gainNodes[this.IDPlaying].gain.cancelScheduledValues(this.waContext.currentTime);
            this.gainNodes[this.IDPlaying].gain.setTargetAtTime(0.0, this.waContext.currentTime + this.fadeDelay, this.fadeOutTime);

            var _this = this;
            var prevID = this.IDPlaying;
            setTimeout(function () { if (_this.IDPlaying !== prevID) audiotag.pause(); }, (_this.fadeOutTime * 2.0 + _this.fadeDelay) * 1000.0 + 5.0);
        } else {
            audiotag.pause();
        }
        this.IDPlaying = -1;
    }
}

// set volume of <audio> tags
AudioPool.prototype.setVolume = function (vol) {
    var vol = $('#VolumeSlider').slider('option', 'value') / 100;

    var audioTags = $('#' + this.PoolID + ' > audio');
    for (var i = 0; i < audioTags.length; i++) {
        audioTags[i].volume = vol;
    }
}

// set loop mode
AudioPool.prototype.setLooped = function (loop) {
    this.LoopAudio = loop;
}


// check for Internet Explorer version
function clientIsIE() {
    if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) { //test for MSIE x.x;
        var ieversion = new Number(RegExp.$1) // capture x.x portion and store as a number
        return ieversion;
    }
    return 0;
}

// check for Firefox
function clientIsFirefox() {
    return typeof InstallTrigger !== 'undefined';
}

// check for Google Chrome/Chromium
function clientIsChrome() {
    return !!window.chrome && !clientIsOpera();
}

// check for Apple Safari
function clientIsSafari() {
    return Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
}

// check for Opera
function clientIsOpera() {
    return !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
}

// get date and time formatted as YYYMMDD-hhmmss
function getDateStamp() {
    var date = new Date();
    function pad(num) {
        num = num + '';
        return num.length < 2 ? '0' + num : num;
    }
    return date.getFullYear() +
        pad(date.getMonth() + 1) +
        pad(date.getDate()) + '-' +
        pad(date.getHours()) +
        pad(date.getMinutes()) +
        pad(date.getSeconds());
}

// provide a virtual download to text file with a specified file name
function saveTextAsFile(txt, fileName) {
    var fileBlob = new Blob([txt], { type: 'text/plain' });

    var downloadLink = document.createElement("a");
    downloadLink.download = fileName;
    downloadLink.innerHTML = "Download File";

    // safari does not download text files but tries to open them in the browser
    // so let's at least open a new window for that
    if (clientIsSafari())
        downloadLink.target = "_blank";

    downloadLink.href = window.URL.createObjectURL(fileBlob);
    downloadLink.onclick = function (event) { document.body.removeChild(event.target); };
    downloadLink.style.display = "none";

    // Firefox requires the link to be added to the DOM
    // before it can be clicked.
    document.body.appendChild(downloadLink);

    downloadLink.click();
}

// shuffle array entries using the Fisher-Yates algorithm
// implementation inspired by http://bost.ocks.org/mike/shuffle/
function shuffleArray(array) {
    var m = array.length, t, i;

    // While there remain elements to shuffle…
    while (m) {

        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }

    return array;
}

// jQuery UI based alert() dialog replacement
$.extend({
    alert: function (message, title) {
        $("<div></div>").dialog({
            buttons: { "Close": function () { $(this).dialog("close"); } },
            close: function (event, ui) { $(this).remove(); },
            resizable: false,
            title: title,
            modal: true
        }).text(message);
    }
});

// ###################################################################
// Listening test main object


// ###################################################################
// constructor and initialization
var ListeningTest = function (TestData) {

    if (arguments.length == 0) return;

    // check if config file is valid
    if (typeof (TestData) == 'undefined') {
        alert('Config file could not be loaded!');
    }

    // check for IE as it does not support the FileAPI-Blob constructor below version 9
    if ((clientIsIE() > 0) && (clientIsIE() < 9)) {
        $('#LoadOverlay').show();
        $('#LoadOverlay').append('<p class="error">Internet Explorer version 8 and below is unfortunately not supported by BeaqleJS. Please update to a recent release or choose another browser.</p>');
        return;
    }

    // Load and verify config
    this.TestConfig = TestData;
    this.setDefaults(this.TestConfig);

    // some state variables
    this.TestState = {
        "CurrentTest": -1, 		// the current test index
        "TestIsRunning": 0,		// is true if test is running, false when finished or not yet started
        "FileMappings": [],		// json array with random file mappings
        "Ratings": [],			// json array with ratings
        "EvalResults": [],      // json array to store the evaluated test results
        "AudiosInLoadQueue": -1,
        "AudioLoadError": false
    }

    this.checkBrowserFeatures();

    // show introduction div
    $('#TestTitle').html(this.TestConfig.TestName);
    $('#TestIntroduction').show();

    // setup buttons and controls
    var handlerObject = this;
    $('#ProgressBar').css('margin-top', $('#ProgressBar').height() + 'px');
    $('#ProgressBar').progressbar();
    $('#BtnNextTest').button();
    $('#BtnNextTest').on('click', $.proxy(handlerObject.nextTest, handlerObject));
    $('#BtnStartTest').button();
    $('#BtnSubmitData').button({ icons: { primary: 'ui-icon-signal-diag' } });
    $('#BtnDownloadData').button({ icons: { primary: 'ui-icon-arrowthickstop-1-s' } });


    // install handler to warn user when test is running and he tries to leave the page
    var testHandle = this.TestState
    window.onbeforeunload = function (e) {
        if (testHandle.TestIsRunning == true) {
            return 'The listening test is not yet finished!';
        } else {
            return;
        }
    }

    // Mine
    var sampleAudio = document.getElementById("myAudio");
    var filePath = this.TestConfig.SampleFile;
    sampleAudio.innerHTML = '<source src=' + filePath + ' type="audio/wav">'

}

// ###################################################################
ListeningTest.prototype.setDefaults = function (config) {
    var defaults = {
        "ShowFileIDs": false,
        "ShowResults": false,
        "LoopByDefault": true,
        "EnableOnlineSubmission": false,
        "BeaqleServiceURL": "",
        "SupervisorContact": "",
        "RandomizeTestOrder": true,
        "MaxTestsPerRun": -1,
        "AudioRoot": "",
        "SampleFile": ""
    }

    for (var property in defaults) {
        if (config[property] === undefined)
            config[property] = defaults[property];
    }
}

// ###################################################################
ListeningTest.prototype.initAudio = function () {
    // create and configure audio pool
    // In versions of chrome > 71 this has to be done in response to
    // a user action in order to be able to play audio (https://goo.gl/7K7WLu)
    this.audioPool = new AudioPool('AudioPool');
    this.audioPool.register();
    this.audioPool.onTimeUpdate = $.proxy(this.audioTimeCallback, this);
    this.audioPool.onError = $.proxy(this.audioErrorCallback, this);
    this.audioPool.onDataLoaded = $.proxy(this.audioLoadedCallback, this);
    this.audioPool.setLooped(this.TestConfig.LoopByDefault);
}

// ###################################################################
ListeningTest.prototype.startTests = function () {
    $('#TestTitle').hide();

    // init audio pool after user started the tests
    this.initAudio();

    // init linear test sequence
    this.TestState.TestSequence = Array();
    for (var i = 0; i < this.TestConfig.Testsets.length; i++)
        this.TestState.TestSequence[i] = i;

    // shorten and/or shuffle the sequence
    if ((this.TestConfig.MaxTestsPerRun > 0) && (this.TestConfig.MaxTestsPerRun < this.TestConfig.Testsets.length)) {
        this.TestConfig.RandomizeTestOrder = true;
        this.TestState.TestSequence = shuffleArray(this.TestState.TestSequence);
        this.TestState.TestSequence = this.TestState.TestSequence.slice(0, this.TestConfig.MaxTestsPerRun);
    } else if (this.TestConfig.RandomizeTestOrder == true) {
        this.TestState.TestSequence = shuffleArray(this.TestState.TestSequence);
    }

    this.TestState.Ratings = Array(this.TestConfig.Testsets.length);
    this.TestState.Runtime = new Uint32Array(this.TestConfig.Testsets.length);
    //        this.TestState.Runtime.forEach(function(element, index, array){array[index] = 0});
    this.TestState.startTime = 0;

    // run first test
    this.TestState.CurrentTest = 0;
    this.runTest(this.TestState.TestSequence[this.TestState.CurrentTest]);
}

// ###################################################################
ListeningTest.prototype.nextTest = function () {

    this.pauseAllAudios();

    // save ratings from last test
    if (this.saveRatings(this.TestState.TestSequence[this.TestState.CurrentTest]) == false)
        return;

    $('#TableContainer').hide();

    // stop time measurement
    var stopTime = new Date().getTime();
    this.TestState.Runtime[this.TestState.TestSequence[this.TestState.CurrentTest]] += stopTime - this.TestState.startTime;

    // go to next test
    if (this.TestState.CurrentTest < this.TestState.TestSequence.length - 1) {
        this.TestState.CurrentTest = this.TestState.CurrentTest + 1;
        this.runTest(this.TestState.TestSequence[this.TestState.CurrentTest]);
    } else {
        // if previous test was last one, ask before loading final page and then exit test
        if (confirm('This was the last test. Do you want to finish?')) {

            $('#TableContainer').hide();
            $('#PlayerControls').hide();
            // $('#TestControls').hide();
            $('#TestEnd').show();

            $('#ResultsBox').html(this.formatResults());
            if (this.TestConfig.ShowResults)
                $("#ResultsBox").show();
            else
                $("#ResultsBox").hide();

            $("#SubmitBox").show();

            $("#SubmitBox > .submitEmail").hide();
            if (this.TestConfig.EnableOnlineSubmission) {
                $("#SubmitBox > .submitOnline").show();
                $("#SubmitBox > .submitDownload").hide();
            } else {
                $("#SubmitBox > .submitOnline").hide();
                if (this.TestConfig.SupervisorContact) {
                    $("#SubmitBox > .submitEmail").show();
                    $(".supervisorEmail").html(this.TestConfig.SupervisorContact);
                }
                if (this.browserFeatures.webAPIs['Blob']) {
                    $("#SubmitBox > .submitDownload").show();
                } else {
                    $("#SubmitBox > .submitDownload").hide();
                    $("#ResultsBox").show();
                }
            }
        }
        return;
    }
}

function runCountDown(ID) {
    // $('#CountDownPrompt').show();

    // Set the date we're counting down to
    // var countDownDate = new Date().getTime();
    var orig_now = new Date().getTime();
    var countDownDate = orig_now + 1000 * baseDelay + 200;

    // Update the count down every 1 second
    var x = setInterval(function () {

        // Get today's date and time
        var now = new Date().getTime();

        // Find the distance between now and the count down date
        var distance = countDownDate - now;

        // Time calculations for days, hours, minutes and seconds
        var seconds = Math.floor((distance % (1000 * 60)) / 1000) + 1;

        // Display the result in the element with id="TestPrompt"
        document.getElementById("TestPrompt").innerHTML = 'Excerpt ' + ID + ' starts in ' + seconds + " seconds. ";
        // document.getElementById("TestPrompt").innerHTML = '<p>' + 'Excerpt ' + ID + ' starts in ' + seconds + " seconds. " + '</p>';

        // If the count down is finished, write some text
        if (distance < 0) {
            clearInterval(x);
            document.getElementById("TestPrompt").innerHTML = 'Excerpt ' + ID;
            // document.getElementById("TestPrompt").innerHTML = '<p>' + 'Excerpt ' + ID + '</p>';
        }
    }, 1000);
}

// ###################################################################    
// prepares display to run test with number TestIdx
ListeningTest.prototype.runTest = function (TestIdx) {

    // clear old test table
    if ($('#TableContainer > table')) {
        $('#TableContainer > table').remove();
    }
    if ($('#TableContainer > span')) {
        $('#TableContainer > span').remove();
    }
    document.getElementById("TestPrompt").innerHTML = '<p> Ready </p>';
    this.pauseAllAudios();

    if ((TestIdx < 0) || (TestIdx > this.TestConfig.Testsets.length)) throw new RangeError("Test index out of range!");

    this.audioPool.clear();
    this.TestState.AudiosInLoadQueue = 0;
    this.TestState.AudioLoadError = false;

    // set current test name
    $('#TestHeading').html("Test " + (this.TestState.CurrentTest + 1) + " of " + this.TestState.TestSequence.length);
    $('#TestHeading').show();

    this.addAudio(TestIdx, "A", "A");
    this.addAudio(TestIdx, "B", "B");

    // hide everything instead of load animation
    $('#TestIntroduction').hide();
    $('#TableContainer').hide();
    $('#PlayerControls').hide();
    $('#LoadOverlay').show();

    // set some state variables
    this.TestState.TestIsRunning = 1;

    var handlerObject = this;
    $('.playButton').each(function () {
        $(this).button();
        var audioID = $(this).attr('rel');
        $(this).on('click', $.proxy(function (event) { handlerObject.playAudio(audioID) }, handlerObject));
    });

    // load and apply already existing ratings
    if (typeof this.TestState.Ratings[TestIdx] !== 'undefined') this.readRatings(TestIdx);

    this.TestState.startTime = new Date().getTime();

    // Play Test Audio
    var audioPoolObj = this.audioPool;

    // Get ready for excerpt A, countdown from 3 to 0 seconds
    runCountDown("A");

    // Play excerpt A delayA = 4 second after the new page
    var delayA = 1000 * (baseDelay + 1); //4 s (3 + 1)
    setTimeout(function () {
        var audioID_A = "A";
        var audiotagA = $('#' + audioPoolObj.PoolID + ' > #audio' + audioID_A).get(0);
        audiotagA.currentTime = 0.000001;
        audioPoolObj.gainNodes[audioID_A].gain.cancelScheduledValues(audioPoolObj.waContext.currentTime);
        audioPoolObj.gainNodes[audioID_A].gain.value = 0.0000001;  // fixes https://bugzilla.mozilla.org/show_bug.cgi?id=1213313
        audioPoolObj.gainNodes[audioID_A].gain.setValueAtTime(0.0000001, audioPoolObj.waContext.currentTime);
        audioPoolObj.gainNodes[audioID_A].gain.setTargetAtTime(1.0, audioPoolObj.waContext.currentTime + audioPoolObj.fadeDelay, audioPoolObj.fadeInTime);
        audioPoolObj.LoopFade = false;
        audiotagA.play();

        audioPoolObj.IDPlaying = audioID_A;
    }, delayA);

    // Interval between excerpt A and B
    // Get ready for excerpt B, countdown from 3 to 0 seconds
    var delayInterval = 1000 * this.TestConfig.Testsets[TestIdx].Duration["A"] + delayA;
    setTimeout(function () {
        runCountDown("B");
    }, delayInterval)

    // Play excerpt B in (baseDelay + Duration A + baseDelay) seconds
    var delayB = delayInterval + 1000 * (baseDelay + 1);
    setTimeout(function () {
        var audioID_B = "B";
        var audiotagB = $('#' + audioPoolObj.PoolID + ' > #audio' + audioID_B).get(0);

        audiotagB.currentTime = 0.000001;
        audioPoolObj.gainNodes[audioID_B].gain.cancelScheduledValues(audioPoolObj.waContext.currentTime);
        audioPoolObj.gainNodes[audioID_B].gain.value = 0.0000001;  // fixes https://bugzilla.mozilla.org/show_bug.cgi?id=1213313
        audioPoolObj.gainNodes[audioID_B].gain.setValueAtTime(0.0000001, audioPoolObj.waContext.currentTime);
        audioPoolObj.gainNodes[audioID_B].gain.setTargetAtTime(1.0, audioPoolObj.waContext.currentTime + audioPoolObj.fadeDelay, audioPoolObj.fadeInTime);
        audioPoolObj.LoopFade = false;
        audiotagB.play();

        audioPoolObj.IDPlaying = audioID_B;

    }, delayB);


    var delayEval = delayB + 1000 * this.TestConfig.Testsets[TestIdx].Duration["B"];

    var nextButton = document.getElementById("BtnNextTest");
    nextButton.disabled = true;
    nextButton.style.visibility = 'hidden';

    setTimeout(function () {

        nextButton.disabled = false;
        nextButton.style.visibility = 'visible';

        document.getElementById("TestPrompt").innerHTML = '<p> Please rate how well A and B match </p>';

        // var title = document.createElement("span");
        // title.innerHTML = '<span>' + "Please rate how well A and B match. " + '</span>';
        // title.setAttribute('id', 'Title');

        // $('#TableContainer').append(title);

        var tab = document.createElement('table');
        tab.setAttribute('id', 'TestTable');

        var row = new Array();
        var cell = new Array();

        row = tab.insertRow(-1);

        cell[0] = row.insertCell(-1);
        cell[0].innerHTML = "<div class='selection'> <span> Bad </span> <input type='radio' name='ItemSelection' id='selectA'/> </div>"
        cell[0].style.width = '80px';

        cell[1] = row.insertCell(-1);
        cell[1].innerHTML = "<div class='selection'> <span> Poor </span> <input type='radio' name='ItemSelection' id='selectB'/> </div>"
        cell[1].style.width = '80px'

        cell[2] = row.insertCell(-1);
        cell[2].innerHTML = "<div class='selection'> <span> Fair </span> <input type='radio' name='ItemSelection' id='selectC'/> </div>";
        cell[2].style.width = '80px'

        cell[3] = row.insertCell(-1);
        cell[3].innerHTML = "<div class='selection'> <span> Good </span> <input type='radio' name='ItemSelection' id='selectD'/> </div>";
        cell[3].style.width = '80px'

        cell[4] = row.insertCell(-1);
        cell[4].innerHTML = "<div class='selection'> <span> Excellent </span> <input type='radio' name='ItemSelection' id='selectE'/> </div>"
        cell[4].style.width = '80px'

        // add spacing
        row = tab.insertRow(-1);
        row.setAttribute("height", "5");

        $('#TableContainer').append(tab);

        // title.before(nextButton);
        // tab.before(nextButton);

    }, delayEval);

}

// ###################################################################
// pause all audios
ListeningTest.prototype.pauseAllAudios = function () {
    this.audioPool.pause();
    $(".playButton").removeClass('playButton-active');
}

// ###################################################################
// read ratings from TestState object
ListeningTest.prototype.readRatings = function (TestIdx) {
    // overwrite and implement in inherited class
    alert('Function readRatings() has not been implemented in your inherited class!');
}

// ###################################################################
// save ratings to TestState object
ListeningTest.prototype.saveRatings = function (TestIdx) {
    // overwrite and implement in inherited class
    alert('Function saveRatings() has not been implemented in your inherited class!');
}

// ###################################################################
// evaluate test and format/print the results
ListeningTest.prototype.formatResults = function () {
    // overwrite and implement in inherited class
    alert('Function formatResults() has not been implemented in your inherited class!');
}

// ###################################################################
// create DOM for test display
ListeningTest.prototype.createTestDOM = function (TestIdx) {
    // overwrite and implement in inherited class
    alert('Function createTestDOM() has not been implemented in your inherited class!');
}

// ###################################################################
// is called whenever an <audio> tag fires the onDataLoaded event
ListeningTest.prototype.audioLoadedCallback = function () {
    this.TestState.AudiosInLoadQueue--;

    // show test if all files finished loading and no errors occured
    if ((this.TestState.AudiosInLoadQueue == 0) && (this.TestState.AudioLoadError == false)) {
        // $('#TestControls').show();
        $('#TableContainer').show();
        $('#PlayerControls').show();
        $('#LoadOverlay').hide();
    }
}

// ###################################################################
// audio loading error callback
ListeningTest.prototype.audioErrorCallback = function (e) {

    this.TestState.AudioLoadError = true;

    var errorTxt = "<p>ERROR ";

    switch (e.target.error.code) {
        case e.target.error.MEDIA_ERR_NETWORK:
            errorTxt += "Network problem, ";
            break;
        case e.target.error.MEDIA_ERR_DECODE:
            errorTxt += "File corrupted or unsupported format, ";
            break;
        case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorTxt += "Wrong URL or unsupported file format, ";
            break;
        default:
            errorTxt += "Unknown error, ";
            break;
    }
    errorTxt += e.target.src + "</p>";

    $('#LoadOverlay').append(errorTxt);
}

// ###################################################################
// audio time update callback
ListeningTest.prototype.audioTimeCallback = function (e) {

    var s = parseInt(e.target.currentTime % 60);
    var m = parseInt((e.target.currentTime / 60) % 60);

    if (m < 10) m = "0" + m;
    if (s < 10) s = "0" + s;

    $('#duration > span').html(m + ':' + s);

    var progress = e.target.currentTime / e.target.duration * 100;

    $('#ProgressBar').progressbar("option", "value", progress);
}



// ###################################################################
//play audio with specified html ID
ListeningTest.prototype.playAudio = function (id) {

    this.audioPool.pause();

    // reset all buttons and sliders
    $('.playButton').removeClass('playButton-active');


    // highlight active slider and button
    $(".playButton[rel=" + id + "]").addClass('playButton-active');

    this.audioPool.play(id);
}

// ###################################################################
// add and load audio file with specified ID
ListeningTest.prototype.addAudio = function (TestIdx, fileID, relID) {
    this.TestState.AudiosInLoadQueue += 1;
    this.audioPool.addAudio(this.TestConfig.AudioRoot +
        this.TestConfig.Testsets[TestIdx].Files[fileID],
        relID)
}

// ###################################################################
// submit test results to server
ListeningTest.prototype.SubmitTestResults = function () {

    var UserObj = new Object();
    UserObj.UserName = $('#UserName').val();
    UserObj.UserEmail = $('#UserEMail').val();
    UserObj.UserComment = $('#UserComment').val();

    var EvalResults = this.TestState.EvalResults;

    EvalResults.push(UserObj)

    var testHandle = this;
    $.ajax({
        type: "POST",
        timeout: 5000,
        url: testHandle.TestConfig.BeaqleServiceURL,
        data: { 'testresults': JSON.stringify(EvalResults), 'username': UserObj.UserName },
        dataType: 'json'
    })
        .done(function (response) {
            if (response.error == false) {
                $('#SubmitBox').html("Your submission was successful.<br/><br/>");
                testHandle.TestState.TestIsRunning = 0;
            } else {
                $('#SubmitError').show();
                $('#SubmitError > #ErrorCode').html(response.message);
                $("#SubmitBox > .submitOnline").hide();
                if (testHandle.TestConfig.SupervisorContact) {
                    $("#SubmitBox > .submitEmail").show();
                    $(".supervisorEmail").html(testHandle.TestConfig.SupervisorContact);
                }
                if (testHandle.browserFeatures.webAPIs['Blob']) {
                    $("#SubmitBox > .submitDownload").show();
                } else {
                    $("#SubmitBox > .submitDownload").hide();
                    $("#ResultsBox").show();
                }
                $('#SubmitData').button('option', { icons: { primary: 'ui-icon-alert' } });
            }
        })
        .fail(function (xhr, ajaxOptions, thrownError) {
            $('#SubmitError').show();
            $('#SubmitError > #ErrorCode').html(xhr.status);
            $("#SubmitBox > .submitOnline").hide();
            if (testHandle.TestConfig.SupervisorContact) {
                $("#SubmitBox > .submitEmail").show();
                $(".supervisorEmail").html(testHandle.TestConfig.SupervisorContact);
            }
            if (testHandle.browserFeatures.webAPIs['Blob']) {
                $("#SubmitBox > .submitDownload").show();
            } else {
                $("#SubmitBox > .submitDownload").hide();
                $("#ResultsBox").show();
            }
        });
    $('#BtnSubmitData').button('option', { icons: { primary: 'load-indicator' } });

}

// ###################################################################
// submit test results to server
ListeningTest.prototype.DownloadTestResults = function () {

    var UserObj = new Object();
    UserObj.UserName = $('#UserName').val();
    UserObj.UserEmail = $('#UserEMail').val();
    UserObj.UserComment = $('#UserComment').val();

    var EvalResults = this.TestState.EvalResults;
    EvalResults.push(UserObj)

    saveTextAsFile(JSON.stringify(EvalResults), getDateStamp() + "_" + UserObj.UserName + ".txt");

    this.TestState.TestIsRunning = 0;
}

// ###################################################################
// Check browser capabilities
ListeningTest.prototype.checkBrowserFeatures = function () {

    var features = new Object();

    features.webAPIs = new Array();
    features.webAPIs['Blob'] = !!window.Blob;

    // check web audio support
    try {
        var genContextClass = (window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.oAudioContext || window.msAudioContext);
        var waContext = new genContextClass();
        features.webAPIs['webAudio'] = waContext !== false;
    } catch (e) {
        // API not supported
        features.webAPIs['webAudio'] = false;
    }

    features.audioFormats = new Array();
    var a = document.createElement('audio');
    features.audioFormats['WAV'] = !!(a.canPlayType && a.canPlayType('audio/wav; codecs="1"').replace(/no/, ''));
    features.audioFormats['FLAC'] = !!(a.canPlayType && a.canPlayType('audio/flac').replace(/no/, ''));
    features.audioFormats['OGG'] = !!(a.canPlayType && a.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, ''));
    features.audioFormats['MP3'] = !!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''));
    features.audioFormats['AAC'] = !!(a.canPlayType && a.canPlayType('audio/mp4; codecs="mp4a.40.2"').replace(/no/, ''));

    this.browserFeatures = features;
}

// ###################################################################
// Get browser features formatted as a HTML string
ListeningTest.prototype.browserFeatureString = function () {
    var featStr = "Available HTML5 browser features:";
    if (this.browserFeatures.webAPIs['webAudio'])
        featStr += " <span class='feature-available'>WebAudioAPI</span>, ";
    else
        featStr += " <span class='feature-not-available'>WebAudioAPI</span>, ";

    if (this.browserFeatures.webAPIs['Blob'])
        featStr += " <span class='feature-available'>BlobAPI</span>, ";
    else
        featStr += " <span class='feature-not-available'>BlobAPI</span>, ";

    if (this.browserFeatures.audioFormats['WAV'])
        featStr += " <span class='feature-available'>WAV</span>, ";
    else
        featStr += " <span class='feature-not-available'>WAV</span>, ";

    if (this.browserFeatures.audioFormats['FLAC'])
        featStr += " <span class='feature-available'>FLAC</span>, ";
    else
        featStr += " <span class='feature-not-available'>FLAC</span>, ";

    if (this.browserFeatures.audioFormats['OGG'])
        featStr += " <span class='feature-available'>Vorbis</span>, ";
    else
        featStr += " <span class='feature-not-available'>Vorbis</span>, ";

    if (this.browserFeatures.audioFormats['MP3'])
        featStr += " <span class='feature-available'>MP3</span>, ";
    else
        featStr += " <span class='feature-not-available'>MP3</span>, ";

    if (this.browserFeatures.audioFormats['AAC'])
        featStr += " <span class='feature-available'>AAC</span>";
    else
        featStr += " <span class='feature-not-available'>AAC</span>";

    return featStr;
}

// ###################################################################
// ABX test main object

// inherit from ListeningTest
function AbxTest(TestData) {
    ListeningTest.apply(this, arguments);
}
AbxTest.prototype = new ListeningTest();
AbxTest.prototype.constructor = AbxTest;


// implement specific code
AbxTest.prototype.createTestDOM = function (TestIdx) {

    // clear old test table
    if ($('#TableContainer > table')) {
        $('#TableContainer > table').remove();
    }

    // var title = document.createElement("span");
    // title.innerHTML = "<span> Please rate how well A and B matches. </span>";

    // create new test table
    var tab = document.createElement('table');
    tab.setAttribute('id', 'TestTable');

    var row = new Array();
    var cell = new Array();

    row = tab.insertRow(-1);

    cell[0] = row.insertCell(-1);
    cell[0].innerHTML = "<div class='selection'> <span> Bad </span> <input type='radio' name='ItemSelection' id='selectA'/> </div>"
    cell[0].style.width = '80px';

    cell[1] = row.insertCell(-1);
    cell[1].innerHTML = "<div class='selection'> <span> Poor </span> <input type='radio' name='ItemSelection' id='selectB'/> </div>"
    cell[1].style.width = '80px'

    cell[2] = row.insertCell(-1);
    cell[2].innerHTML = "<div class='selection'> <span> Fair </span> <input type='radio' name='ItemSelection' id='selectC'/> </div>";
    cell[2].style.width = '80px'

    cell[3] = row.insertCell(-1);
    cell[3].innerHTML = "<div class='selection'> <span> Good </span> <input type='radio' name='ItemSelection' id='selectD'/> </div>";
    cell[3].style.width = '80px'

    cell[4] = row.insertCell(-1);
    cell[4].innerHTML = "<div class='selection'> <span> Excellent </span> <input type='radio' name='ItemSelection' id='selectE'/> </div>"
    cell[4].style.width = '80px'

    // add spacing
    row = tab.insertRow(-1);
    row.setAttribute("height", "5");

    // append the created table to the DOM
    $('#TableContainer').append(tab);

    // randomly preselect one radio button
    if (typeof this.TestState.Ratings[TestIdx] == 'undefined') {
        /*if (Math.random() > 0.5) {
           $("#selectB").prop("checked", true);
        } else {
           $("#selectA").prop("checked", true);
        }*/
    }
}


AbxTest.prototype.readRatings = function (TestIdx) {

    if (this.TestState.Ratings[TestIdx] === 1) {
        $("#selectA").prop("checked", true);
    } else if (this.TestState.Ratings[TestIdx] === 2) {
        $("#selectB").prop("checked", true);
    } else if (this.TestState.Ratings[TestIdx] === 3) {
        $("#selectC").prop("checked", true);
    } else if (this.TestState.Ratings[TestIdx] === 4) {
        $("#selectD").prop("checked", true);
    } else if (this.TestState.Ratings[TestIdx] === 5) {
        $("#selectE").prop("checked", true);
    }


}

AbxTest.prototype.saveRatings = function (TestIdx) {

    if ($("#selectA").prop("checked")) {
        this.TestState.Ratings[TestIdx] = 1;
    } else if ($("#selectB").prop("checked")) {
        this.TestState.Ratings[TestIdx] = 2;
    } else if ($("#selectC").prop("checked")) {
        this.TestState.Ratings[TestIdx] = 3;
    } else if ($("#selectD").prop("checked")) {
        this.TestState.Ratings[TestIdx] = 4;
    } else if ($("#selectE").prop("checked")) {
        this.TestState.Ratings[TestIdx] = 5;
    } else {
        $.alert("Not rated!");
        return false;
    }
}

AbxTest.prototype.formatResults = function () {

    var resultstring = "";
    var tab = document.createElement('table');
    var row;
    var cell;

    var numCorrect = 0;
    var numWrong = 0;

    // evaluate single tests
    for (var i = 0; i < this.TestConfig.Testsets.length; i++) {
        this.TestState.EvalResults[i] = new Object();
        this.TestState.EvalResults[i].TestID = this.TestConfig.Testsets[i].TestID;

        if (this.TestState.TestSequence.indexOf(i) >= 0) {
            row = tab.insertRow(-1);

            cell = row.insertCell(-1);
            cell.innerHTML = this.TestConfig.Testsets[i].Name + "(" + this.TestConfig.Testsets[i].TestID + ")";
            cell = row.insertCell(-1);

            cell.innerHTML = this.TestState.Ratings[i];
            this.TestState.EvalResults[i].ratings = this.TestState.Ratings[i];

        }
    }

    resultstring += tab.outerHTML;

    resultstring += "<br/><p>Percentage of correct assignments: " + (numCorrect / this.TestConfig.Testsets.length * 100).toFixed(2) + " %</p>";

    return resultstring;
}