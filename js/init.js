/**
  * Version 0.2.0
  * Copyright (c) 2015 Myles English
  * http://webmonkeydd.com/vexflow-notation-editor
 */

//This online notation editor is built using the VexFlow Javascript API, Javascript, jQuery (for now anyway) and Bootstrap for Styling.

var scoreJson = {
  'score-partwise': {
    '@version': '3.0',
    'part-list': {
      'score-part': {
        '@id': 'P1',
        'part-name': {}
      }
    },
    part: {         // currently support only for one part
      '@id': 'P1',
      measure: [
        {
          '@number': 1
        }
      ]
    }
  }
};

var vfStaves = [];
var vfStaveNotes = [];

var editor = {};
editor.canvas = $("#notation-canvas")[0];
editor.renderer = new Vex.Flow.Renderer(editor.canvas, Vex.Flow.Renderer.Backends.SVG);
editor.ctx = editor.renderer.getContext();    //SVGContext

editor.clefDropdown = document.getElementById('clef-dropdown');
editor.keySignature = document.getElementById('key-signature');
editor.timeSigTop = $('#timeSigTop').val();
editor.timeSigBottom = $('#timeSigBottom').val();

// editor.measuresPerLine = 4;
editor.staveHeight = 140;
editor.canRedraw = true;

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

editor.mySelect = {
  measure: {
    id: 0,
    previousId: 0
  },
  note: {
    id: 0,
    previousId: 0
  }
}

editor.getRadioValue = function(name){
  var radios = document.getElementsByName(name);
  for(i=0; i<radios.length; i++){
    if(radios[i].checked){
      return radios[i].value;
      break;
    }
  }
}

/*

*/
editor.getInsertNote = function(evt){
  // find the mouse position and return the correct note for that position.
  var y = editor.selected.measure.y;
  var notesArray = ['c/','d/','e/','f/','g/','a/','b/'];
  var count = 0;

  var checkboxValue = $('#dotted-checkbox').is(":checked");
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

function printAttributes () {
  var attributes = {};
  for (var i in scoreJson["score-partwise"].part.measure) {
    var measure = scoreJson["score-partwise"].part.measure[i];
    if (measure['attributes']) {
      attributes = measure['attributes'];
    }
  }
  // console.log(editor.notes1);
}