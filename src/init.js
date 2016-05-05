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
    part: [
      {
        '@id': 'P1',
        measure: [
          {
            '@number': 1,
            attributes: {
              divisions: 4,
              key: {
                fifths: 0,
                mode: 'major'
              },
              time: {
                beats: 4,
                'beat-type': 4
              },
              clef: {
                sign: 'G',
                line: 2
              }
            },
            note: [
              {
                rest: null,
                duration: 16
              }
            ]
          }
        ]
      }
    ]
  }
};

var uploadedFileName = 'score';

// one <measure> in MusicXML -> one Vex.Flow.Stave
// all of these three arrays below use share same index
var vfStaves = [];       // array with currently rendered vexflow measures(Vex.Flow.Stave)
var xmlAttributes = [];  // array of MusicXML attributes for each measure
var vfStaveNotes = [];   // array of arrays with notes to corresponding stave in vfStaves

var editor = {};
editor.svgElem = $("#svg-container")[0];
// editor.renderer = new Vex.Flow.Renderer('svg-container', Vex.Flow.Renderer.Backends.SVG);
editor.renderer = new Vex.Flow.Renderer(editor.svgElem, Vex.Flow.Renderer.Backends.SVG);
editor.ctx = editor.renderer.getContext();    //SVGContext

editor.clefDropdown = document.getElementById('clef-dropdown');
editor.keySignature = document.getElementById('key-signature');
editor.timeSigTop = $('#timeSigTop').val();
editor.timeSigBottom = $('#timeSigBottom').val();

// some default sizes
editor.staveWidth = 150;
editor.staveHeight = 140;
editor.noteWidth = 40;

editor.mode = "measure";    // measure or note

editor.selected = {
  cursorNoteKey: '',
  measure: {
    id: 'm0',
    previousId: 'm0'
  },
  note: {
    id: 'm0n0',
    previousId: 'm0n0'
  }
}

editor.mousePos = {
  current: {
    x: 0,
    y: 0
  },
  previous: {
    x: 0,
    y: 0
  }
};