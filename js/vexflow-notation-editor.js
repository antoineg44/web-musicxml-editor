/**
  * Version 0.2.0
  * Copyright (c) 2015 Myles English
  * http://webmonkeydd.com/vexflow-notation-editor
 */

//This online notation editor is built using the VexFlow Javascript API, Javascript, jQuery (for now anyway) and Bootstrap for Styling.

var xmlInit = '<?xml version="1.0" encoding="UTF-8" standalone="no"?> \
            <!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd"> \
            <score-partwise version="3.0"></score-partwise>';
var xmlInitDoc = $.parseXML(xmlInit);
var $xml = $(xmlInitDoc);

// note: pure js createElement is faster
// http://stackoverflow.com/questions/268490/jquery-document-createelement-equivalent
// http://jsperf.com/jquery-vs-createelement
// TODO: create own test case on jsperf.com
$xml.find(':root').append('<part-list></part-list>');
$xml.find(':root').append('<part></part>');
$xml.find('part').append($xml[0].createElement('measure')); // $xml.find('part').append('<measure></measure>');
$xml.find('measure').append('<note></note>');

// var scorePartwise = {};

// scorePartwise.parts = [
//   measures = [
//     {
//       attributes: {  //ADDED
//         clef: 'treble',
//         timeSigTop: 4,
//         timeSigBottom: 4,
//         keySig: 'C',
//       },
//       v1: [{
//         keys: 'C/4',
//         duration: 'q',
//         x: 200,
//         y: 200,
//         accidental: '#',
//         dotted: false,
//       }],
//       v2: [],
//       x: 400,
//       y: 400,
//       width: 200,
//       noteCount: 0,
//     },
//   ]
// ];

var editor = {};
editor.canvas = $("#notation-canvas")[0];
editor.renderer = new Vex.Flow.Renderer(editor.canvas, Vex.Flow.Renderer.Backends.SVG);
editor.ctx = editor.renderer.getContext();

// editor.chord = [];

// editor.canvas = canvas = document.getElementsById('notation-canvas')[0];
// editor.context = canvas.getContext('2d');

editor.clefDropdown = document.getElementById('clef-dropdown');
editor.voiceDropdown = document.getElementById('voice');
editor.keySignature = document.getElementById('key-signature');
editor.timeSigTop = $('#timeSigTop').val();
editor.timeSigBottom = $('#timeSigBottom').val();

// editor.measuresPerLine = 4;
editor.staveHeight = 140;

// editor.frameLengthMs = 1000;
// editor.frameCount = 1;

editor.measures = [   //measures/tacts, in vexflow there is a new stave for each measure
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

  // if(checkboxValue == true){
  //   var d = 'd';
  // }else{
  //   var d = '';
  // }
  var d = checkboxValue ? 'd' : '';

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

    // editor.frameCount = editor.frameCount + 1;
    // if(editor.frameCount > 30){
    //   editor.frameCount = 0;
    // }

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
    for(i=0; i<editor.measures.length; i++){
      var noteCount = 0;
      // find the longest voice
      if(editor.measures[i].hasOwnProperty('v1')){
        noteCount = editor.measures[i].v1.length;
        voiceLengths.push(noteCount);
      }
      if(editor.measures[i].hasOwnProperty('v2')){
        noteCount = editor.measures[i].v2.length;
        voiceLengths.push(noteCount);
      }
    }

    if(voiceLengths.length >= 1){
      voiceLengths.sort(function(a,b){return b-a;});
      maxLength = voiceLengths[0];
      var noteWidth = 40;
      var minWidth = noteWidth * maxLength;
    }else{
      minWidth = 40;
    }

    var count = 0;

    var staveX = 10;
    var staveY = 0;

    // draw the staves
    // console.log($xml.find("measure").length);
    for(i=0; i<editor.measures.length; i++){

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

      editor.measures[i].measure = i + 1;
      editor.measures[i].width = staveWidth;  
      editor.measures[i].x = staveX - staveWidth;
      editor.measures[i].y = staveY;
      editor.measures[i].height = editor.staveHeight;

      var stave = new Vex.Flow.Stave(editor.measures[i].x, editor.measures[i].y, editor.measures[i].width);

      if(editor.measures[i].clef != null){
        stave.addClef(editor.measures[i].clef).setContext(editor.ctx);  
        var currentClef = editor.measures[i].clef;
      }else{
        //stave.setContext(editor.ctx);
      }

      if(editor.measures[i].keySig != null){
        var keySig = new Vex.Flow.KeySignature(editor.measures[i].keySig);
        keySig.addToStave(stave);
        var currentKeySig = editor.measures[i].keySig;
      }

      if(newLine == true){
        stave.addClef(currentClef).setContext(editor.ctx);  
        var keySig = new Vex.Flow.KeySignature(currentKeySig);
        keySig.addToStave(stave);
      }

      if(editor.measures[i].showTimeSig == true){
        stave.addTimeSignature(editor.measures[i].timeSigTop + '/' + editor.measures[i].timeSigBottom);
      }

      stave.setContext(editor.ctx).draw();

      //draw the notes
      //TODO: replace notes1 by local variable, it's useless as a global
      editor.notes1 = [];
      editor.notes2 = [];

      if(editor.measures[i].hasOwnProperty('v1')){
        for(n=0; n<editor.measures[i].v1.length; n++){

          var accidental = editor.measures[i].v1[n].accidental;
          var dotted = editor.measures[i].v1[n].dotted;

          var note = new Vex.Flow.StaveNote(editor.measures[i].v1[n]);
          if (accidental != null) note.addAccidental(0, new Vex.Flow.Accidental(accidental));
          if (dotted == true) note.addDotToAll();
          var noteId = 'm' + i + 'n' + n;   //identification for note, n.o. of measure and note in it
          note.setId(noteId);   //set id for note DOM element in svg
          editor.notes1.push(note);
          
          editor.measures[i].v1[n].x = editor.notes1[n].note_heads[0].x;
          editor.measures[i].v1[n].y = editor.notes1[n].note_heads[0].y;
        
        }

        var voice1 = new Vex.Flow.Voice({
            num_beats: editor.measures[i].timeSigTop,
            beat_value: editor.measures[i].timeSigTop,    //TODO: is it correct? change it to time SigBottom
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


        // This is only helper function to justify and draw a 4/4 voice
        // TODO: replace it with something like: voice.draw(ctx, stave);
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

        for(n=0; n<editor.measures[i].v1.length; n++){
          if(editor.notes1[n] != undefined){
            if(editor.measures[i].v1[n].keys != null){
              // adds x and y positoins to the staves notes
              editor.measures[i].v1[n].x = editor.notes1[n].note_heads[0].x;
              editor.measures[i].v1[n].y = editor.notes1[n].note_heads[0].y;  
            } 

            //adding handlers for interactivity: (from vexflow stavenote_tests.js line 463)
            var item = editor.notes1[n].getElem();
            item.addEventListener("mouseover", function() {
              Vex.forEach($(this).find("*"), function(child) {
                // console.log('mouseover');
                child.setAttribute("fill", "green");
                child.setAttribute("stroke", "green");
              });
            }, false);
            item.addEventListener("mouseout", function() {
              Vex.forEach($(this).find("*"), function(child) {
                // console.log('mouseout');
                child.setAttribute("fill", "black");
                child.setAttribute("stroke", "black");
              });
            }, false);
            item.addEventListener("click", function() {
              Vex.forEach($(this).find("*"), function(child) {
                //TODO: unset class selected-note from previous selected note
                //and set class selected-note to this one
                //note styling will be based on the class
                //OR: set class or styling based on editor.selected.note
                // console.log('click');
                child.setAttribute("fill", "red");
                child.setAttribute("stroke", "red");
              });
            }, false);
          }
        }
      }
      count++;
    }
  }
}

editor.add = {
  measure: function(){
    var staveLn = editor.measures.length;
    var selectedMeasure = editor.selected.measure.selection;

    //first added measure at initialization
    if(selectedMeasure == null && staveLn < 1) {
      editor.measures.push({
        timeSigTop: 4,
        timeSigBottom: 4,
        showTimeSig: true,
        clef: 'treble',
      });
    }
    //no measure selected, new will be added to the end
    else if(selectedMeasure == null && staveLn >= 1) {
      editor.measures.push({
        timeSigTop: null,
        timeSigBottom: null,
        showTimeSig: false,
        clef: null,
      });
    }
    //some measure selected, new will be added after selected one
    else {
      editor.measures.splice(selectedMeasure, 0, {
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

      if(editor.measures[selectedMeasure].hasOwnProperty(selectedNoteVoice)){
        editor.measures[selectedMeasure][selectedNoteVoice].push(
          { 
            keys: [insertNote], 
            duration: thisNoteValue + thisNoteOrRest,
            dotted: checkboxValue,
          }
        );
      }else{
        editor.measures[selectedMeasure][selectedNoteVoice] = [];
        editor.measures[selectedMeasure][selectedNoteVoice].push(
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
    editor.measures[editor.selected.measure.selection - 1].clef = dropdownValue;
  },
  keySignature: function(){ 
    editor.measures[editor.selected.measure.selection - 1].keySig = editor.keySignature.value;
  },
  timeSignature: function(){
    var top = $('#timeSigTop').val();
    var bottom = $('#timeSigBottom').val();
    var selectedMeasure = editor.selected.measure.selection - 1;

    editor.measures[selectedMeasure].timeSigTop = top;
    editor.measures[selectedMeasure].timeSigBottom = bottom;
    editor.measures[selectedMeasure].showTimeSig = true;
  },
  accidental: function(){
    var selectedMeasure = editor.selected.measure.selection - 1;
    var selectedNoteVoice = 'v' + editor.voiceDropdown.value;
    var accidental = editor.getRadioValue('note-accidental');
    editor.measures[selectedMeasure][selectedNoteVoice][editor.selected.note.selection].accidental = accidental;
  }, 
  dot: function(){
    var selectedMeasure = editor.selected.measure.selection - 1;
    var selectedNoteVoice = 'v' + editor.voiceDropdown.value;
    var checkboxValue = $('#dotted-checkbox').is(":checked");
    // var isSelectedNoteDotted = editor.measures[selectedMeasure][selectedNoteVoice][editor.selected.note.selection].dotted;

    editor.measures[selectedMeasure][selectedNoteVoice][editor.selected.note.selection].dotted = checkboxValue;
  }
}

editor.delete = {
  measure: function(){
    //TODO: editor.selected.measure can be null/undefined
    var nextMeasureWidth = editor.selected.measure.width;
    nextMeasureWidth = parseInt(nextMeasureWidth);
    // splice the selected measure
    editor.measures.splice(editor.selected.measure.selection - 1, 1);

    //useless:            (nevertheless, author is better programmer than me), stay humble :)
    // if(editor.notes)
    //   editor.notes.splice(editor.selected.measure.selection - 1, 1);

    // reset the selected measure to the measure after the measure that was just deleted
    editor.selected.measure.selection = editor.selected.measure.selection + 1;
    editor.selected.measure.width = nextMeasureWidth;
    // reset all measure numbers
    for(i=0; i<editor.measures.length; i++){
      editor.measures[i].measure = i + 1;
    }
  },
  note: function(){
    var selectedNoteVoice = 'v' + editor.selected.note.voice;

    editor.measures[editor.selected.measure.selection - 1][selectedNoteVoice].splice(editor.selected.note.selection, 1);
    editor.selected.note.selection = null;
    editor.selected.note.clicked = false;
  },
  clef: function(){
    editor.measures[editor.selected.measure.selection - 1].clef = null;
  },
  timeSignature: function(){
    editor.measures[editor.selected.measure.selection - 1].showTimeSig = false;
  },
  accidental: function(){
    var selectedMeasure = editor.selected.measure.selection - 1;
    var selectedNoteVoice = 'v' + editor.voiceDropdown.value;
    editor.measures[selectedMeasure][selectedNoteVoice][editor.selected.note.selection].accidental = null;
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
    for(i=0; i<editor.measures.length; i++){
      var width = editor.measures[i].width;
      var height = editor.measures[i].height;
      var xStart = editor.measures[i].x;
      var yStart = editor.measures[i].y;
      var xEnd = xStart + width;
      var yEnd = yStart + height;

      /* Start point[xStart, yStart] is on top-left
       * End point[xEnd, yEnd] is on bottom-right
       */

      //if clicked on measure
      if(editor.mousePos.x >= xStart && editor.mousePos.x <= xEnd &&
         editor.mousePos.y >= yStart && editor.mousePos.y <= yEnd) {

        //if clicked second time on already(previously) selected measure
        if(editor.mousePos.x >= editor.selected.measure.x
        && editor.mousePos.x <= editor.selected.measure.x + editor.selected.measure.width
        && editor.mousePos.y >= editor.selected.measure.y
        && editor.mousePos.y <= editor.selected.measure.y + editor.selected.measure.height
        ){
          editor.selected.measure.doubleClick = true;
          editor.selected.measure.previousSelection = editor.selected.measure.selection;
        }
        else {
          editor.selected.note.selection = null;
          editor.selected.note.clicked = false;
          editor.selected.measure.doubleClick = false;
          editor.selected.measure.previousSelection = editor.selected.measure.selection;
        }

        editor.selected.measure.selection = editor.measures[i].measure;
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
      for(v=1; v<=2; v++){
        var noteVoice = 'v'+ v;
      
        if(editor.measures[editor.selected.measure.selection - 1].hasOwnProperty(noteVoice)){
          // loop through notes
          for(n=0; n<editor.measures[editor.selected.measure.selection - 1][noteVoice].length; n++){
            if(editor.mousePos.x >= editor.measures[editor.selected.measure.selection - 1][noteVoice][n].x
            && editor.mousePos.x <= editor.measures[editor.selected.measure.selection - 1][noteVoice][n].x + 10 
            && editor.mousePos.y >= editor.measures[editor.selected.measure.selection - 1][noteVoice][n].y - 5
            && editor.mousePos.y + 5 <= editor.measures[editor.selected.measure.selection - 1][noteVoice][n].y + 10
            ){
              editor.selected.note.selection = n;
              editor.selected.note.clicked = true;
              editor.selected.note.x = editor.measures[editor.selected.measure.selection - 1][selectedNoteVoice][n].x - 10;
              editor.selected.note.y = editor.measures[editor.selected.measure.selection - 1][selectedNoteVoice][n].y - 15;
              editor.selected.note.width = 30;
              editor.selected.note.height = 30;
              var selectedNote = true;

              // Set the value of the dotted checkbox accordingly
              var selectedMeasure = editor.selected.measure.selection - 1;
              var checkboxValue = $('#dotted-checkbox').is(":checked");
              var isSelectedNoteDotted = editor.measures[selectedMeasure][selectedNoteVoice][editor.selected.note.selection].dotted;

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
editor.canvas.addEventListener('mousemove', redraw);
editor.canvas.addEventListener('mousemove', getMousePos);
editor.canvas.addEventListener('mousemove', returnInsertNote);

function redraw() {
  //redraw on mousemove only when adding new note
  if(editor.getRadioValue('tools') == 'add')
    editor.draw.staves();
}

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