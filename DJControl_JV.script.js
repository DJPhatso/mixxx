
//
// ****************************************************************************
// * Mixxx mapping script file for the Hercules DJControl Jogvision.
// * Author: DJ Phatso, contributions by Kerrick Staley
// * Version 1.1 (March 2019)
// * Forum: https://www.mixxx.org/forums/viewtopic.php?f=7&t=12580
// * Wiki: https://www.mixxx.org/wiki/doku.php/hercules_dj_control_jogvision


// Changes to v1.1
// - Controller knob/slider values are queried on startup, so MIXXX is synced.
// - Fixed vinyl button behavior the first time it's pressed.
//
// v1.0 : Original release


// TODO: Functions that could be implemented to the script:
//	- Jogwheel Outer LED : To be maped to ????
//	- Beats LED
//	  
//
// ****************************************************************************
function DJCJV() {}
var DJCJV = {};

DJCJV.scratchButtonState = true;


//Vu Meter
DJCJV.vuMeterUpdateDA = function(value, group, control) {
    value = (value*6);
    switch (control) {
        case "[Channel1]", "VuMeter":
            midi.sendShortMsg(0x90, 0x44, value);
            break;
    }

}

DJCJV.vuMeterUpdateDB = function(value, group, control) {
    value = (value *6);
    switch (control) {
        case "[Channel2]", "VuMeter":
            midi.sendShortMsg(0x91, 0x44, value);
            break;
    }

}

//Jogwheels inner LED display - Play position
DJCJV.wheelInnerUpdateDA = function(value, group, control) {
    value = (value *127);
    switch (control) {
        case "[Channel1]", "playposition":
            midi.sendShortMsg(0xB0, 0x61, value);
            break;
    }

}

DJCJV.wheelInnerUpdateDB = function(value, group, control) {
    value = (value * 127);
    switch (control) {
        case "[Channel2]", "playposition":
            midi.sendShortMsg(0xB1, 0x61, value);
            break;
    }

}



DJCJV.init = function() {

	
	//Update all LED states
	midi.sendShortMsg(0xB0, 0x7F, 0x00);
	midi.sendShortMsg(0xB1, 0x7F, 0x00);
	
    // Vinyl button LED On.
    midi.sendShortMsg(0x90, 0x45, 0x7F);
	

    // Connect the VUMeters and Jog Inner LED
    engine.connectControl("[Channel1]", "VuMeter", "DJCJV.vuMeterUpdateDA");
    engine.connectControl("[Channel2]", "VuMeter", "DJCJV.vuMeterUpdateDB");
    engine.connectControl("[Channel1]", "playposition", "DJCJV.wheelInnerUpdateDA");
    engine.connectControl("[Channel2]", "playposition", "DJCJV.wheelInnerUpdateDB");
	
		
	// Headphone CUE/MIX state
	if(engine.getValue("[Master]", "headMix") > 0.5) {
		midi.sendShortMsg(0x90, 0x4C, 0x7f) // headset "Mix" button LED
	} else {
		midi.sendShortMsg(0x90, 0x4D, 0x7f) // headset "Cue" button LED
	}
	//Enable Soft takeover
	engine.softTakeover("[Master]","crossfader",true);
	engine.softTakeover("[QuickEffectRack1_[Channel1]]","super1",true);
	engine.softTakeover("[QuickEffectRack1_[Channel2]]","super1",true);
	
	//Set effects Levels - Dry/Wet - Filters
	engine.setParameter("[EffectRack1_EffectUnit1_Effect1]", "meta", 0.6);
	engine.setParameter("[EffectRack1_EffectUnit1_Effect2]", "meta", 0.6);
	engine.setParameter("[EffectRack1_EffectUnit1_Effect3]", "meta", 0.6);
	engine.setParameter("[EffectRack1_EffectUnit2_Effect1]", "meta", 0.6);
	engine.setParameter("[EffectRack1_EffectUnit2_Effect2]", "meta", 0.6);
	engine.setParameter("[EffectRack1_EffectUnit2_Effect3]", "meta", 0.6);
	engine.setParameter("[EffectRack1_EffectUnit1]", "mix", 0.6);
	engine.setParameter("[EffectRack1_EffectUnit2]", "mix", 0.6);
	engine.setParameter("[QuickEffectRack1_[Channel1]]","super1", 0.5);
	engine.setParameter("[QuickEffectRack1_[Channel2]]","super1", 0.5);
	
	// Ask the controller to send all current knob/slider values over MIDI, which will update
    // the corresponding GUI controls in MIXXX.
    midi.sendShortMsg(0xB0, 0x7F, 0x7F);
	
};



// Headphone CUE/MIX buttons status
DJCJV.headCue = function(midino, control, value, status, group) {
	if(engine.getValue(group, "headMix") == 0) {
		engine.setValue(group, "headMix", -1.0);
		midi.sendShortMsg(0x90, 0x4D, 0x7f);
		midi.sendShortMsg(0x90, 0x4C, 0x00);
	}
};

DJCJV.headMix = function(midino, control, value, status, group) {
	if(engine.getValue(group, "headMix") != 1) {
		engine.setValue(group, "headMix", 0);
		midi.sendShortMsg(0x90, 0x4D, 0x00);
		midi.sendShortMsg(0x90, 0x4C, 0x7f);
	}
};




DJCJV.FilterDA = function(channel, control, value, status, group) { 
    var currentValue = engine.getValue(group,"super1"); {
    engine.setValue(group,"super1", 0.5 -(value)/255);
	} 
}

DJCJV.FilterDB = function(channel, control, value, status, group) { 
    var currentValue = engine.getValue(group,"super1"); {
    engine.setValue(group,"super1", 0.5 -(value)/255);
	} 
}



DJCJV.loopsizeDA = function(channel, control, value, status, group){
	var currentValue = engine.getValue(group,"beatloop_size"); {
	if (value > 64) {
        engine.setValue(group,"beatloop_size",currentValue /= 2);
    } else {
        engine.setValue(group,"beatloop_size", currentValue *= 2);
    }
   }
};

DJCJV.loopsizeDB = function(channel, control, value, status, group){
	var currentValue = engine.getValue(group,"beatloop_size"); {
	if (value > 64) {
        engine.setValue(group,"beatloop_size",currentValue /= 2);
    } else {
        engine.setValue(group,"beatloop_size", currentValue *= 2);
    }
  }
};


// The Vinyl button, used to enable or disable scratching on the jog wheels.
DJCJV.vinylButtonA = function(channel, control, value, status, group) {
    if (value) {
        if (DJCJV.scratchButtonState) {
			DJCJV.scratchButtonState = false;
            midi.sendShortMsg(0x90, 0x46, 0x00);

        } else {
			DJCJV.scratchButtonState = true;
            midi.sendShortMsg(0x90, 0x46, 0x7F);
        }
    }
};



// The pressure action over the jog wheel

DJCJV.wheelTouchA = function(channel, control, value, status, group) {
    channel = channel + 1;
    if (value > 0 && (engine.getValue("[Channel1]", "play") != 1 || DJCJV.scratchButtonState)) {
        //  Touching the wheel.
        var alpha = 1.0 / 8;
        var beta = alpha / 16;
        engine.scratchEnable(1, 400, 33 + 1 / 3, alpha, beta);
    } else {
        // Released the wheel.
        engine.scratchDisable(1);
    }
};

DJCJV.wheelTouchB = function(channel, control, value, status, group) {
    channel = channel + 2;
    if (value > 0 && (engine.getValue("[Channel2]", "play") != 1 || DJCJV.scratchButtonState)) {
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
DJCJV.scratchWheelA = function(channel, control, value, status, group) {

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
}

DJCJV.scratchWheelB = function(channel, control, value, status, group) {

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
}

// Using the side of wheel for the bending
DJCJV.bendWheelA = function(channel, control, value, status, group) {

    var newValue;
    if (value < 64) {
        newValue = value;
    } else {
        newValue = value - 128;
    }

    {
        engine.setValue('[Channel' + 1 + ']', 'jog', newValue); // Pitch bend
    }
}


DJCJV.bendWheelB = function(channel, control, value, status, group) {

    // A: For a control that centers on 0:
    var newValue;
    if (value < 64) {
        newValue = value;
    } else {
        newValue = value - 128;
    } {
        engine.setValue('[Channel' + 2 + ']', 'jog', newValue); // Pitch bend
    }
}



DJCJV.shutdown = function() {


	midi.sendShortMsg(0xB0, 0x7F, 0x00);
	midi.sendShortMsg(0xB1, 0x7F, 0x00);
};