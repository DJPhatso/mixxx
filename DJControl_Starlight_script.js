
//
// ****************************************************************************
// * Mixxx mapping script file for the Hercules DJControl Starlight.
// * Author: DJ Phatso
// * Version 1.0 (March 2019)
// * Forum: http://www.mixxx.org/forums/
// * Wiki: http://www.mixxx.org/wiki/
// ****************************************************************************

// ****************************************************************************
//Functions that could be implemented to the script:
//
//* Tweak/map the base LED to other functions (if possible)
//* FX:
//   - Potentially pre-select/load effects into deck and set parameters  			  
//* Tweak Jog wheels sensitivity
//* Make the vinyl buttons (scratch enable/Disable) actually work.... 
//* Optimize JS code.
// ****************************************************************************


function DJCStarlight() {}
var DJCStarlight = {};

DJCStarlight.vinylButton = [true]


DJCStarlight.init = function() {
    
		
	// Turn off base LED default behavior
	midi.sendShortMsg(0x90,0x24,0x00);
	
	// Connect the base LEDs
    engine.connectControl("[Channel1]","VuMeterL","DJCStarlight.baseLEDUpdate");
    engine.connectControl("[Channel2]","VuMeterR","DJCStarlight.baseLEDUpdate");
	
	
	//Set effects Levels - Dry/Wet
	engine.setParameter("[EffectRack1_EffectUnit1_Effect1]", "meta", 0.6);
	engine.setParameter("[EffectRack1_EffectUnit1_Effect2]", "meta", 0.6);
	engine.setParameter("[EffectRack1_EffectUnit1_Effect3]", "meta", 0.6);
	engine.setParameter("[EffectRack1_EffectUnit2_Effect1]", "meta", 0.6);
	engine.setParameter("[EffectRack1_EffectUnit2_Effect2]", "meta", 0.6);
	engine.setParameter("[EffectRack1_EffectUnit2_Effect3]", "meta", 0.6);
	engine.setParameter("[EffectRack1_EffectUnit1]", "mix", 1);
	engine.setParameter("[EffectRack1_EffectUnit2]", "mix", 1);
	
};

// The base LED are mapped to the VU Meter for light show.
DJCStarlight.baseLEDUpdate = function (value, group, control){
    value = (value*127);
    switch(control) {
    case "VuMeterL":
        midi.sendShortMsg(0x91, 0x23, value);
        break;
		
    case "VuMeterR":
        midi.sendShortMsg(0x92, 0x23, value);
        break;
    }
}

// The Vinyl button, used to enable or disable scratching on the jog wheels (The Vinyl button enableds both deck).

DJCStarlight.vinylButton = function(channel, control, value, status, group) {
    if (value > 0 ) {
        if (DJCStarlight.scratchEnabled) {
            DJCStarlight.scratchEnabled = false;
            midi.sendShortMsg(0x91,0x03,0x00);
            
        } else {
            DJCStarlight.scratchEnabled = true;
            midi.sendShortMsg(0x91,0x03,0x7F);
            
        }
    }
};



// The pressure action over the jog wheel

DJCStarlight.wheelTouchA = function (channel, control, value, status, group) {
    channel = channel+1;
    if (value > 0 && (engine.getValue("[Channel1]", "play") != 1 || DJCStarlight.vinylButton)){
        //  Touching the wheel.
        var alpha = 1.0/8;
        var beta = alpha/32;
        engine.scratchEnable(1, 600, 33+1/3, alpha, beta);
    } else {
        // Released the wheel.
        engine.scratchDisable(1);
    }
};

DJCStarlight.wheelTouchB = function (channel, control, value, status, group) {
    channel = channel+2;
    if (value > 0 && (engine.getValue("[Channel2]", "play") != 1 || DJCStarlight.vinylButton)) {
        // Touching the wheel.
        var alpha = 1.0/8;
        var beta = alpha/32;
        engine.scratchEnable(2, 600, 33+1/3, alpha, beta);
    } else {
        // Released the wheel.
        engine.scratchDisable(2);
    }
};
 
// The wheel that actually controls the scratching
DJCStarlight.scratchWheelA = function (channel, control, value, status, group) {
  

    var newValue;
    if (value < 64) {
        newValue = value;
    } else {
        newValue = value - 128;
    }
 
 
    if (engine.isScratching(1)) {
        engine.scratchTick(1, newValue); // Scratch!
    } 
}


// The wheel that actually controls the bending
DJCStarlight.bendWheelA = function (channel, control, value, status, group) {
  
 
    var newValue;
    if (value < 64) {
        newValue = value;
    } else {
        newValue = value - 128;
    }
 
 
    // In either case, register the movement
    if (engine.isScratching(1)) {
        engine.scratchTick(1, newValue); // Scratch!
    } else {
        engine.setValue('[Channel'+1+']', 'jog', newValue); // Pitch bend
    }
}

DJCStarlight.scratchWheelB = function (channel, control, value, status, group) {
  
 
    // A: For a control that centers on 0:
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
}


// The wheel that actually controls the bending
DJCStarlight.bendWheelB = function (channel, control, value, status, group) {
  
 
    // A: For a control that centers on 0:
    var newValue;
    if (value < 64) {
        newValue = value;
    } else {
        newValue = value - 128;
    }
 
 
    // In either case, register the movement
    /* if (engine.isScratching(1)) {
        engine.scratchTick(1, newValue); // Scratch!
    } else */ {
        engine.setValue('[Channel'+2+']', 'jog', newValue); // Pitch bend
    }
}



DJCStarlight.shutdown = function() {
	
	// Reset base LED 
	midi.sendShortMsg(0x90,0x24,0x7F);
    
};