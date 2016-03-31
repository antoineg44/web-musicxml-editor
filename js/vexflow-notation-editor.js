/**
  * Version 0.2.0
  * Copyright (c) 2015 Myles English
  * http://webmonkeydd.com/vexflow-notation-editor
 */

//This online notation editor is built using the VexFlow Javascript API, Javascript, jQuery (for now anyway) and Bootstrap for Styling.

// Below is an example of the array of staves objects and their properties.  
// Each key in the staves array represents a single measure.
// v1, v2, v3 and v4 store each note for their respective voice in the measure.  
//These measures and ntoes are then rendered using the VexFlow API.

/*
editor.staves = [
  {
    clef: 'treble',
    timeSigTop: 4,
    timeSigBottom: 4,
    keySig: 'C',
    v1: [{
      keys: 'C/4',
      duration 'q',
      x: 200,
      y: 200,
      accidental: '#',
      dotted: false,
    }],
    v2: [],
    v3: [],
    v4: [],
    x: 400,
    y: 400,
    width: 200,
    noteCount: 0,
  },
];
*/

var editor = {};
editor.canvas = $("#notation-canvas")[0];
editor.renderer = new Vex.Flow.Renderer(editor.canvas, Vex.Flow.Renderer.Backends.SVG);
editor.ctx = editor.renderer.getContext();

editor.chord = [];

// editor.canvas = canvas = document.getElementsById('notation-canvas')[0];
// editor.context = canvas.getContext('2d');

editor.clefDropdown = document.getElementById('clef-dropdown');
editor.voiceDropdown = document.getElementById('voice');
editor.keySignature = document.getElementById('key-signature');
editor.timeSigTop = $('#timeSigTop').val();
editor.timeSigBottom = $('#timeSigBottom').val();

editor.measures = 1;  //probably stave...?
editor.measuresPerLine = 4;
editor.staveHeight = 140;

editor.frameLengthMs = 1000;
editor.frameCount = 1;

editor.staves = [   //measures/tacts
  {
    clef: 'treble',
    timeSigTop: 4,
    timeSigBottom: 4,
    showTimeSig: true,
    keySig: 'C',
    width: 200,
    noteCount: 0,
  },
];

editor.getRadioValue = function(name){
  var radios = document.getElementsByName(name);
  for(i=0; i<radios.length; i++){
    if(radios[i].checked){
      return radios[i].value;
      break;
    }
  }
}
editor.getInsertNote = function(evt){
  // find the mouse position and return the correct note for that position.
  var y = editor.selected.measure.y;
  var notesArray = ['c/','d/','e/','f/','g/','a/','b/'];
  var count = 0;

  var checkboxValue = $('#dotted-checkbox').is(":checked");

  if(checkboxValue == true){
    var d = 'd';
  }else{
    var d = '';
  }

  for(i=5; i>=0; i--){
    for(l=0; l<notesArray.length; l++){
      var noteOffset = (count * 35) - (l * 5 - 17);
      if(editor.mousePos.y >= y + noteOffset && editor.mousePos.y <= 5 + y + noteOffset){
        var insertNote = notesArray[l] + (i+1) + d;
        var found = true;
        break;
      }
      if(found == true){
        break;
      }
    }
    count++;
  }
  return insertNote;
},

editor.draw = {
  staves: function(){

    editor.frameCount = editor.frameCount + 1;
    if(editor.frameCount > 30){
      editor.frameCount = 0;
    }


    var noteValue = editor.getRadioValue('note-value');
    var selectOrAdd = editor.getRadioValue('tools');

    // editor.ctx.clearRect(0, 0, editor.canvas.width, editor.canvas.height);
    editor.ctx.clear();
    canvasWidth = document.getElementById('canvas-wrapper').clientWidth;
    $('#notation-canvas').attr('width', canvasWidth);

    // render the selected measure border
    if(editor.selected.measure.doubleClick === true){
      editor.ctx.rect(editor.selected.measure.x, editor.selected.measure.y, editor.selected.measure.width, editor.selected.measure.height);
      editor.ctx.fillStyle = '#FFF7D9';
        editor.ctx.fill();
        editor.ctx.lineWidth = 0;
        editor.ctx.strokeStyle = '#FFF7D9';
      editor.ctx.stroke();
    }else{
      editor.ctx.rect(editor.selected.measure.x, editor.selected.measure.y, editor.selected.measure.width, editor.selected.measure.height);
        editor.ctx.fillStyle = '#F0F0F0';
        editor.ctx.fill();
        editor.ctx.lineWidth = 0;
        editor.ctx.strokeStyle = '#F0F0F0';
      editor.ctx.stroke();
    }
    if(editor.selected.measure.doubleClick === true){
      editor.ctx.strokeStyle = 'black';
      editor.ctx.rect(editor.selected.note.x, editor.selected.note.y, editor.selected.note.width, editor.selected.note.height);
      editor.ctx.stroke();
    }
    editor.ctx.fillStyle = 'black';
    editor.ctx.strokeStyle = 'black';
    // find the min-width needed for a measure
    var voiceLengths = [];
    for(i=0; i<editor.staves.length; i++){
      var noteCount = 0;
      // find the longest voice
      if(editor.staves[i].hasOwnProperty('v1')){
        noteCount = editor.staves[i].v1.length;
        voiceLengths.push(noteCount);
      }
      if(editor.staves[i].hasOwnProperty('v2')){
        noteCount = editor.staves[i].v2.length;
        voiceLengths.push(noteCount);
      }
      if(editor.staves[i].hasOwnProperty('v3')){
        noteCount = editor.staves[i].v3.length;
        voiceLengths.push(noteCount);
      }
      if(editor.staves[i].hasOwnProperty('v4')){
        noteCount = editor.staves[i].v4.length;
        voiceLengths.push(noteCount);
      }
    }

    if(voiceLengths.length >= 1){
      voiceLengths.sort(function(a,b){return b-a;});
      maxLength = voiceLengths[0];
      var noteWidth = 30;
      var minWidth = noteWidth * maxLength;
    }else{
      minWidth = 30;
    }

    var count = 0;

    var staveX = 10;
    var staveY = 0;

    // draw the staves
    for(i=0; i<editor.staves.length; i++){

      // find line break points
      for(br=6; br>=0; br--){
        if(canvasWidth / br >= minWidth){
          var staveWidth = canvasWidth / br - 10;
          break;
        }
      }

      var staveEnd = staveX + staveWidth;
      if(staveEnd > canvasWidth){
        staveX = 10;
        staveY = staveY + editor.staveHeight;
        newLine = true;
      }else{
        newLine = false;
      }

      staveX = staveX + staveWidth;

      editor.staves[i].measure = i + 1;
      editor.staves[i].width = staveWidth;  
      editor.staves[i].x = staveX - staveWidth;
      editor.staves[i].y = staveY;
      editor.staves[i].height = editor.staveHeight;

      var stave = new Vex.Flow.Stave(editor.staves[i].x, editor.staves[i].y, editor.staves[i].width);

      if(editor.staves[i].clef != null){
        stave.addClef(editor.staves[i].clef).setContext(editor.ctx);  
        var currentClef = editor.staves[i].clef;
      }else{
        //stave.setContext(editor.ctx);
      }

      if(editor.staves[i].keySig != null){
        var keySig = new Vex.Flow.KeySignature(editor.staves[i].keySig);
        keySig.addToStave(stave);
        var currentKeySig = editor.staves[i].keySig;
      }

      if(newLine == true){
        stave.addClef(currentClef).setContext(editor.ctx);  
        var keySig = new Vex.Flow.KeySignature(currentKeySig);
        keySig.addToStave(stave);
      }

      if(editor.staves[i].showTimeSig == true){
        stave.addTimeSignature(editor.staves[i].timeSigTop + '/' + editor.staves[i].timeSigBottom);
      }

      stave.setContext(editor.ctx).draw();

      //draw the notes
      editor.notes1 = [];
      editor.notes2 = [];
      editor.notes3 = [];
      editor.notes4 = [];

      if(editor.staves[i].hasOwnProperty('v1')){
        for(n=0; n<editor.staves[i].v1.length; n++){

          var accidental = editor.staves[i].v1[n].accidental;
          var dotted = editor.staves[i].v1[n].dotted;


          if(accidental != null && dotted != false){
            editor.notes1.push(new Vex.Flow.StaveNote(
              editor.staves[i].v1[n]
            ).addAccidental(0, new Vex.Flow.Accidental(accidental)).addDotToAll()); 
          } else if(accidental != null){
            editor.notes1.push(new Vex.Flow.StaveNote(
              editor.staves[i].v1[n]
            ).addAccidental(0, new Vex.Flow.Accidental(accidental))); 
          } else if(dotted == true){
            editor.notes1.push(new Vex.Flow.StaveNote(
              editor.staves[i].v1[n]
            ).addDotToAll()); 
          } else{
            editor.notes1.push(new Vex.Flow.StaveNote(
              editor.staves[i].v1[n]
            ));             
          }

          // maybe equvalent code to above if-elses ^ (not tested)          
          // var note = new Vex.Flow.StaveNote(editor.staves[i].v1[n]);
          // if (accidental != null) note.addAccidental(0, new Vex.Flow.Accidental(accidental));
          // if (dotted == true) note.addDotToAll();
          // editor.notes1.push(note);
          
          editor.staves[i].v1[n].x = editor.notes1[n].note_heads[0].x;
          editor.staves[i].v1[n].y = editor.notes1[n].note_heads[0].y;
        
        }

        var voice1 = new Vex.Flow.Voice({
            num_beats: editor.staves[i].timeSigTop,
            beat_value: editor.staves[i].timeSigTop,    //is it correct?
            resolution: Vex.Flow.RESOLUTION
          });

        voice1.setStrict(false);

        // draw the cursor note
        if(i == editor.selected.measure.selection - 1 && selectOrAdd == 'add'){
            editor.notes1.push(new Vex.Flow.StaveNote(
            {
              keys: [editor.selected.insertNote],
              duration: noteValue,
            }
          )); 
        }

          voice1.addTickables(editor.notes1);

        Vex.Flow.Formatter.FormatAndDraw(editor.ctx, stave, editor.notes1);

        //https://github.com/0xfe/vexflow/wiki/Automatic-Beaming:
        var beams = new Vex.Flow.Beam.generateBeams(editor.notes1, {
          groups: [new Vex.Flow.Fraction(4, 8)]
        });

        // if(editor.frameCount % 30 == 0){
        //   console.log(editor.notes1); 
        // }
        
        beams.forEach(function(beam) {
          beam.setContext(editor.ctx).draw();
        });

        // adds x and y positoins to the staves notes
        for(n=0; n<editor.staves[i].v1.length; n++){
          if(editor.staves[i].v1[n].keys != null){
            
            if(editor.notes1[n] != undefined){
              editor.staves[i].v1[n].x = editor.notes1[n].note_heads[0].x;
              editor.staves[i].v1[n].y = editor.notes1[n].note_heads[0].y;  
            } 
          }
        }
      }
      count++;
    }
  }
}

editor.add = {
  measure: function(){
    var staveLn = editor.staves.length;
    var selectedMeasure = editor.selected.measure.selection;

    if(selectedMeasure == null && staveLn < 1){   //first added measure at initialization
      editor.staves.push({
        timeSigTop: 4,
        timeSigBottom: 4,
        showTimeSig: true,
        clef: 'treble',
      });
    }else if(selectedMeasure == null && staveLn >= 1){
      editor.staves.push({
        timeSigTop: null,
        timeSigBottom: null,
        showTimeSig: false,
        clef: null,
      });
    }else{
      editor.staves.splice(selectedMeasure, 0, {
        timeSigTop: null,
        timeSigBottom: null,
        showTimeSig: false,
        clef: null,
      });
    }   
  },
  note: function(){
          
    var selectedVoice = editor.voiceDropdown.value;
    var thisNoteOrRest = editor.getRadioValue('note-or-rest');
    var thisNoteValue = editor.getRadioValue('note-value');
    var thisNoteOrChord = editor.getRadioValue('note-or-chord');
    var toolValue = editor.getRadioValue('tools');

    // find the mouse position and insert the correct note
    if(editor.selected.measure.doubleClick === true && toolValue == 'add'){

      var insertNote = editor.getInsertNote();

      var selectedNoteVoice = 'v' + selectedVoice;
      var selectedMeasure = editor.selected.measure.selection - 1;

      var checkboxValue = $('#dotted-checkbox').is(":checked");

      if(editor.staves[selectedMeasure].hasOwnProperty(selectedNoteVoice)){
        editor.staves[selectedMeasure][selectedNoteVoice].push(
          { 
            keys: [insertNote], 
            duration: thisNoteValue + thisNoteOrRest,
            dotted: checkboxValue,
          }
        );
      }else{
        editor.staves[selectedMeasure][selectedNoteVoice] = [];
        editor.staves[selectedMeasure][selectedNoteVoice].push(
          { 
            keys: [insertNote], 
            duration: thisNoteValue + thisNoteOrRest,
            dotted: checkboxValue,
          }
        );
      }
    }
  },
  clef: function(){
    var dropdownValue = editor.clefDropdown.value;
    editor.staves[editor.selected.measure.selection - 1].clef = dropdownValue;
  },
  keySignature: function(){ 
    editor.staves[editor.selected.measure.selection - 1].keySig = editor.keySignature.value;
  },
  timeSignature: function(){
    var top = $('#timeSigTop').val();
    var bottom = $('#timeSigBottom').val();
    var selectedMeasure = editor.selected.measure.selection - 1;

    editor.staves[selectedMeasure].timeSigTop = top;
    editor.staves[selectedMeasure].timeSigBottom = bottom;
    editor.staves[selectedMeasure].showTimeSig = true;
  },
  accidental: function(){
    var selectedMeasure = editor.selected.measure.selection - 1;
    var selectedNoteVoice = 'v' + editor.voiceDropdown.value;
    var accidental = editor.getRadioValue('note-accidental');
    editor.staves[selectedMeasure][selectedNoteVoice][editor.selected.note.selection].accidental = accidental;
  }, 
  dot: function(){
    var selectedMeasure = editor.selected.measure.selection - 1;
    var selectedNoteVoice = 'v' + editor.voiceDropdown.value;
    var checkboxValue = $('#dotted-checkbox').is(":checked");
    var isSelectedNoteDotted = editor.staves[selectedMeasure][selectedNoteVoice][editor.selected.note.selection].dotted;

    editor.staves[selectedMeasure][selectedNoteVoice][editor.selected.note.selection].dotted = checkboxValue;
  }
}

editor.delete = {
  measure: function(){
    var nextMeasureWidth = editor.selected.measure.width;
    nextMeasureWidth = parseInt(nextMeasureWidth);
    // splice the selected measure
    editor.staves.splice(editor.selected.measure.selection - 1, 1);
    if(editor.notes)
      editor.notes.splice(editor.selected.measure.selection - 1, 1);
    // reset the selected measure to the measure after the measure that was just deleted
    editor.selected.measure.selection = editor.selected.measure.selection + 1;
    editor.selected.measure.width = nextMeasureWidth;
    // reset all measure numbers
    for(i=0; i<editor.staves.length; i++){
      editor.staves[i].measure = i + 1;
    }
  },
  note: function(){
    var selectedNoteVoice = 'v' + editor.selected.note.voice;

    editor.staves[editor.selected.measure.selection - 1][selectedNoteVoice].splice(editor.selected.note.selection, 1);
    editor.selected.note.selection = null;
    editor.selected.note.clicked = false;
  },
  clef: function(){
    editor.staves[editor.selected.measure.selection - 1].clef = null;
  },
  timeSignature: function(){
    editor.staves[editor.selected.measure.selection - 1].showTimeSig = false;
  },
  accidental: function(){
    var selectedMeasure = editor.selected.measure.selection - 1;
    var selectedNoteVoice = 'v' + editor.voiceDropdown.value;
    editor.staves[selectedMeasure][selectedNoteVoice][editor.selected.note.selection].accidental = null;
  }
}

editor.select = {
  getMousePos: function(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  },
  measure: function(){    
    for(i=0; i<editor.staves.length; i++){
      var width = editor.staves[i].width;
      var height = editor.staves[i].height;
      var xStart = editor.staves[i].x;
      var yStart = editor.staves[i].y;
      var xEnd = xStart + width;
      var yEnd = yStart + height;

      if(editor.mousePos.x >= xStart && editor.mousePos.x <= xEnd && editor.mousePos.y >= yStart && editor.mousePos.y <= yEnd){
        // previous or selected measure
        if(editor.mousePos.x >= editor.selected.measure.x && editor.mousePos.x <= editor.selected.measure.x + editor.selected.measure.width && editor.mousePos.y >= editor.selected.measure.y && editor.mousePos.y <= editor.selected.measure.y + editor.selected.measure.height){
          editor.selected.measure.doubleClick = true;
          editor.selected.measure.previousSelection = editor.selected.measure.selection;
        }else{
          editor.selected.note.selection = null;
          editor.selected.note.clicked = false;
          editor.selected.measure.doubleClick = false;
          editor.selected.measure.previousSelection = editor.selected.measure.selection;
        }
        editor.selected.measure.selection = editor.staves[i].measure;
        editor.selected.measure.x = xStart;
        editor.selected.measure.y = yStart;
        editor.selected.measure.width = width;
        editor.selected.measure.height = height;
        break;
      }
    }
  },
  note: function(evt){
    var noteSelected = false;
    var toolValue = editor.getRadioValue('tools');
    var selectedNoteVoice = 'v' + editor.voiceDropdown.value;

    if(toolValue == 'select' ){
      for(v=1; v<=4; v++){
        var noteVoice = 'v'+ v;
      
        if(editor.staves[editor.selected.measure.selection - 1].hasOwnProperty(noteVoice)){
          // loop through notes
          for(n=0; n<editor.staves[editor.selected.measure.selection - 1][noteVoice].length; n++){
            if(editor.mousePos.x >= editor.staves[editor.selected.measure.selection - 1][noteVoice][n].x
              && editor.mousePos.x <= editor.staves[editor.selected.measure.selection - 1][noteVoice][n].x + 10 
              && editor.mousePos.y >= editor.staves[editor.selected.measure.selection - 1][noteVoice][n].y - 5
              && editor.mousePos.y + 5 <= editor.staves[editor.selected.measure.selection - 1][noteVoice][n].y + 10
            ){
              editor.selected.note.selection = n;
              editor.selected.note.clicked = true;
              editor.selected.note.x = editor.staves[editor.selected.measure.selection - 1][selectedNoteVoice][n].x - 10;
              editor.selected.note.y = editor.staves[editor.selected.measure.selection - 1][selectedNoteVoice][n].y - 15;
              editor.selected.note.width = 30;
              editor.selected.note.height = 30;
              var selectedNote = true;

              // Set the value of the dotted checkbox accordingly
              var selectedMeasure = editor.selected.measure.selection - 1;
              var checkboxValue = $('#dotted-checkbox').is(":checked");
              var isSelectedNoteDotted = editor.staves[selectedMeasure][selectedNoteVoice][editor.selected.note.selection].dotted;

              if(isSelectedNoteDotted == true){
                $('#dotted-checkbox').prop('checked', true);
              }else{
                $('#dotted-checkbox').prop('checked', false);
              }

              break;
            }else{
              var selectedNote = false;
              editor.selected.note.selection = null;
              editor.selected.note.clicked = false;
            }
          }
        }
        if(selectedNote == true){
          editor.selected.note.voice = v;
          break;
        }
      }
    }
  }
}

// The "selected" object is used for storing details of the current selection.
editor.selected = {
  insertNote: null,
  measure: {
    selection: null,
    previousSelection: null,
    doubleClick: false,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  },
  note: {
    selection: null,
    previousSelection: null,
    clicked: false,
    doubleClick: false,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    voice: 1,
  }
}

$("#control-panel")[0].addEventListener('click', editor.draw.staves);

editor.canvas.addEventListener('click', editor.select.measure);
editor.canvas.addEventListener('click', editor.select.note);
editor.canvas.addEventListener('click', editor.add.note);
editor.canvas.addEventListener('click', editor.draw.staves);
editor.canvas.addEventListener('mousemove', editor.draw.staves);
editor.canvas.addEventListener('mousemove', getMousePos);
editor.canvas.addEventListener('mousemove', returnInsertNote);

function getMousePos(evt){
    editor.mousePos = editor.select.getMousePos(editor.canvas, evt);
}

function returnInsertNote(){
  editor.selected.insertNote = editor.getInsertNote();
}

// setInterval(onTimerTick, editor.frameLengthMs); // 33 milliseconds = ~ 30 frames per sec

editor.draw.staves();

function onTimerTick() {
    editor.draw.staves();
}

function printNotes1 () {
  console.log(editor.notes1);
}