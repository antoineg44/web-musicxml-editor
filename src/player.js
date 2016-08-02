/*  Author: Andre Bakker, VexUI project
 * 	This class requires the MIDI.js in the project to work correctly.
 * 
 */

Vex.UI.Player = function (handler){
	this.events = [];
	this.handler = handler;
	this.currentTime = 0;
	this.currentEventIndex = 0;
	this.ready = false;
	this.loadInstrument("acoustic_grand_piano");
	this.playing = false;
};

Vex.UI.Player.prototype.loadInstrument = function(instrumentName, onReady){
	var player = this;
	//Initialize the player
	MIDI.loadPlugin({
		soundfontUrl: "./soundfont/",
		instrument: instrumentName,
		callback: function(){
			player.ready = true;
			if(onReady)
				onReady();
		}
	});
}

Vex.UI.Player.prototype.onPlayFinished = function(callback){
	this.callback = callback;
}

/**
 * Add functionality to add events manually, instead of using loadFile
 * @param event -> must have these attributes:
 * channel -> integer
 * subtype -> 'noteOn' | 'noteOff' | 'chordOn' | 'chordOff'
 * noteNumber -> integer
 * velocity -> integer (only required when subtype == 'noteOn' | 'chordOn')
 * queuedTime -> float (when the event will be triggered)
 */
Vex.UI.Player.prototype.addEvent = function(event){
	this.events.push(event);
};


Vex.UI.Player.prototype.addEvents = function(eventList){
	this.events = this.events.concat(eventList);
};

Vex.UI.Player.prototype.play = function(self){
	if(self === undefined)
		self = this;
	self.playing = true;
	if(self.currentEventIndex >= self.events.length){
		self.playing = false;
		return self.callback();
	}
	
	var event = self.events[self.currentEventIndex];
	
	if(self.currentTime <= event.queuedTime){
		//Fire the event
		self.fireEvent(event);
		
		//Increment the current event and add current time
		if(self.currentEventIndex + 1 >= self.events.length){
			self.playing = false;
			return self.callback();
		}
		var timeUntilNextEvent = self.events[self.currentEventIndex + 1].queuedTime -
								self.events[self.currentEventIndex].queuedTime;
		
		self.currentEventIndex++;
		self.currentTime += timeUntilNextEvent;
		
		self.scheduledId = setTimeout(self.play, timeUntilNextEvent * 1000, self);
	}
	
};

Vex.UI.Player.prototype.stop = function(){
	if(this.scheduledId){
		clearTimeout(this.scheduledId);
		this.clear();
		this.playing = false;
		while(this.events.length){
			var event = this.events.pop();
			if(event.subtype == "noteOff" || event.subtype == "chordOff")
				this.fireEvent(event);
		}
	}
};


Vex.UI.Player.prototype.fireEvent = function(event){
	switch(event.subtype){
		case 'noteOn':
			MIDI.noteOn(event.channel, event.noteNumber, event.velocity, 0);
			event.note.setHighlight(true);
			self.handler.redraw();
			break;
		case 'noteOff':
			MIDI.noteOff(event.channel, event.noteNumber, 0);
			event.note.setHighlight(false);
			self.handler.redraw();
			break;
		case 'chordOn':
			MIDI.chordOn(event.channel, event.noteNumber, event.velocity, 0);
			event.note.setHighlight(true);
			self.handler.redraw();
			break;
		case 'chordOff':
			MIDI.chordOff(event.channel, event.noteNumber, 0);
			event.note.setHighlight(false);
			self.handler.redraw();
			break;
	}
};

Vex.UI.Player.prototype.clear = function(){
	this.scheduledId = null;
	this.currentTime = 0;
	this.currentEventIndex = 0;
};


Vex.UI.Handler.play = function(){

	var playButton, stopButton;

	if(this.toolbar){
		playButton = this.toolbar.buttons.play;
		stopButton = this.toolbar.buttons.stop;

		//enable stop, disable play
		stopButton.disabled = false;
		playButton.disabled = true;
	}

	//TODO RPM should be set outside...
	var rpm = 120;
	var playInfo = { 
			delay: 0,
			rpm: rpm,
			defaultTime : (rpm / 60) // to seconds
			};
	//var script = "MIDI.setVolume(0, 127);";
	var playEvents = [];
	for(var i = 0; i < this.staveList.length; i++){
		var stave = this.staveList[i];
		//set clef to playinfo
		playInfo.clef = stave.clef;

		//Call initial barline play events
		// var barNote = new Vex.Flow.BarNote();
		// barNote.setType(stave.modifiers[0].barline);
		// playEvents = playEvents.concat(barNote.getPlayEvents(playInfo, playEvents));

		for(var j = 0; j < stave.getTickables().length; j++){
			var tickable = stave.getTickables()[j];
			playEvents = playEvents.concat(tickable.getPlayEvents(playInfo, playEvents));
		}		

		//Call final barline play events
		// barNote.setType(stave.modifiers[1].barline);
		// playEvents = playEvents.concat(barNote.getPlayEvents(playInfo, playEvents));
	}
	
	Vex.UI.Player.addEvents(playEvents);
	Vex.UI.Player.onPlayFinished(function(){
		//Reenable play and disable stop
		if(playButton)
			playButton.disabled = false;
		if(stopButton)
			stopButton.disabled = true;
	});
	Vex.UI.Player.play();
};

Vex.UI.Handler.stop = function(){
	Vex.UI.Player.stop();
		
	if(this.toolbar){
		playButton = this.toolbar.buttons.play;
		stopButton = this.toolbar.buttons.stop;

		//enable stop, disable play
		playButton.disabled = false;
		stopButton.disabled = true;
	}

};