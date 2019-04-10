
//
// ****************************************************************************
// * Mixxx mapping script file for the Hercules DJControl Inpulse 300.
// * Author: DJ Phatso
// * Version 1.0 (March 2019)
// * Forum: https://www.mixxx.org/forums/viewtopic.php?f=7&t=12599
// * Wiki: https://mixxx.org/wiki/doku.php/hercules_djcontrol_inpulse_300

// TODO: Functions that could be implemented to the script:
//
// * ROLL: Keep SLIP active (if already enabled) when exiting from rolls
//
// * SLICER/SLICER LOOP: Potentialy use adapt the script of the Pioneer DDJ SX: 
//  https://www.mixxx.org/wiki/doku.php/pioneer_ddj-sx#slicer_description
//
// * TONEPLAY
//
// * FX:
//	- Potentially use 1 FX rack for FX pads and another for the Controlled FX
//  - See how to preselect efffects for a rack
		  

// ****************************************************************************
function DJCi300() {}
var DJCi300 = {};

DJCi300.scratchButtonStateDA = true;
DJCi300.scratchButtonStateDB = true;


DJCi300.vuMeterUpdate = function (value, group, control) {
    value = (value * 127) + 5;
    switch (control) {

        case "VuMeterL":
            midi.sendShortMsg(0xB0, 0x40, value);
            break;

        case "VuMeterR":
            midi.sendShortMsg(0xB0, 0x41, value);
            break;
    }

};

DJCi300.vuMeterUpdateDA = function   (value, group, control) {
    value = (value * 127) + 5;
    switch (control) {
        case "[Channel1]", "VuMeter":
            midi.sendShortMsg(0xB1, 0x40, value);
            break;
    }

};

DJCi300.vuMeterUpdateDB = function(value, group, control) {
    value = (value * 127) + 5;
    switch (control) {
        case "[Channel1]", "VuMeter":
            midi.sendShortMsg(0xB2, 0x40, value);
            break;
    }

};



DJCi300.init = function() {


    // Turn On Vinyl buttons LED(one for each deck).
    midi.sendShortMsg(0x91, 0x03, 0x7F);
    midi.sendShortMsg(0x92, 0x03, 0x7F);

	//Turn On Browser button LED
	midi.sendShortMsg(0x90, 0x05, 0x10);

  
    // Connect the VUMeters
    engine.connectControl("[Channel1]", "VuMeter", "DJCi300.vuMeterUpdateDA");
    engine.connectControl("[Channel2]", "VuMeter", "DJCi300.vuMeterUpdateDB");
    engine.connectControl("[Master]", "VuMeterL", "DJCi300.vuMeterUpdate");
    engine.connectControl("[Master]", "VuMeterR", "DJCi300.vuMeterUpdate");
	
	// Connect the Browser LEDs
    engine.getValue("[Library]", "MoveFocus");
	engine.getValue("[Master]", "maximize_library");

	
	// Ask the controller to send all current knob/slider values over MIDI, which will update
    // the corresponding GUI controls in MIXXX.
    midi.sendShortMsg(0xB0, 0x7F, 0x7F);
};


// The Vinyl button, used to enable or disable scratching on the jog wheels (One per deck).

DJCi300.vinylButtonDA = function(channel, control, value, status, group) {
    if (value) {
        if (DJCi300.scratchButtonStateDA) {
			DJCi300.scratchButtonStateDA = false;
            midi.sendShortMsg(0x91, 0x03, 0x00);

        } else {
			DJCi300.scratchButtonStateDA = true;
            midi.sendShortMsg(0x91, 0x03, 0x7F);

        }
    }
};

DJCi300.vinylButtonDB = function(channel, control, value, status, group) {
    if (value) {
        if (DJCi300.scratchButtonStateDB) {
			DJCi300.scratchButtonStateDB = false;
            midi.sendShortMsg(0x92, 0x03, 0x00);

        } else {
			DJCi300.scratchButtonStateDB = true;
            midi.sendShortMsg(0x92, 0x03, 0x7F);

        }
    }
};

// The touch action over the jog wheel

DJCi300.wheelTouchDA = function(channel, control, value, status, group) {
    channel = channel + 1;
    if (value > 0 && (engine.getValue("[Channel1]", "play") != 1 || DJCi300.scratchButtonStateDA)) {
        //  Touching the wheel.
        var alpha = 1.0 / 8;
        var beta = alpha / 32;
        engine.scratchEnable(1, 400, 33 + 1 / 3, alpha, beta);
    } else {
        // Released the wheel.
        engine.scratchDisable(1);
    }
};

DJCi300.wheelTouchDB = function(channel, control, value, status, group) {
    channel = channel + 2;
    if (value > 0 && (engine.getValue("[Channel2]", "play") != 1 || DJCi300.scratchButtonStateDB)) {
        // Touching the wheel.
        var alpha = 1.0 / 8;
        var beta = alpha / 32;
        engine.scratchEnable(2, 400, 33 + 1 / 3, alpha, beta);
    } else {
        // Released the wheel.
        engine.scratchDisable(2);
    }
};



// Using the top of wheel for scratching (Vinyl button On) and bending (Vinyl button Off)
DJCi300.scratchWheelDA = function(channel, control, value, status, group) {

    var newValue;
    if (value < 64) {
        newValue = value;
    } else {
        newValue = value - 128;
    }

    if (engine.isScratching(1)) {
        engine.scratchTick(1, newValue); // Scratch!
    } else {
        engine.setValue('[Channel' + 1 + ']', 'jog', newValue); // Pitch bend
    }
};

DJCi300.scratchWheelDB = function(channel, control, value, status, group) {

    var newValue;
    if (value < 64) {
        newValue = value;
    } else {
        newValue = value - 128;
    }

    // In either case, register the movement
    if (engine.isScratching(2)) {
        engine.scratchTick(2, newValue); // Scratch!
    } else {
        engine.setValue('[Channel' + 2 + ']', 'jog', newValue); // Pitch bend
    }
};

// Using the side of wheel for the bending
DJCi300.bendWheelDA = function(channel, control, value, status, group) {

    var newValue;
    if (value < 64) {
        newValue = value;
    } else {
        newValue = value - 128;
    }

    {
        engine.setValue('[Channel' + 1 + ']', 'jog', newValue); // Pitch bend
    }
};


// The wheel that actually controls the bending
DJCi300.bendWheelDB = function(channel, control, value, status, group) {

    // A: For a control that centers on 0:
    var newValue;
    if (value < 64) {
        newValue = value;
    } else {
        newValue = value - 128;
    }

    {
        engine.setValue('[Channel' + 2 + ']', 'jog', newValue); // Pitch bend
    }
};

//Using FX mode Pad 7 and 8 for scratching effect
DJCi300.scratchPadDA = function(channel, control, value, status, group) {

    var newValue;
    if (value < 64) {
        newValue = value;
    } else {
        newValue = value - 128;
    }

    if (engine.isScratching(1)) {
        engine.scratchTick(1, newValue); // Scratch!
    }  
    
};

DJCi300.scratchPadDB = function(channel, control, value, status, group) {

    var newValue;
    if (value < 64) {
        newValue = value;
    } else {
        newValue = value - 128;
    }

    // In either case, register the movement
    if (engine.isScratching(2)) {
        engine.scratchTick(2, newValue); // Scratch!
    } 
};



DJCi300.shutdown = function() {

};