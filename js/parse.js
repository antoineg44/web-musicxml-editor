/*
performs transformation from scoreJson to vfStaves[] and vfStaveNotes[]
*/
editor.parse = {
  all: function() {
  // all: function(scoreJson, vfStaves, vfStaveNotes) {
    vfStaves = [];
    vfStaveNotes = [];
    var vfStave;
    for (var i = 0; i < scoreJson["score-partwise"].part[0].measure.length; i++) {
      vfStave = editor.parse.measure(scoreJson["score-partwise"].part[0].measure[i], vfStaveNotes);
      vfStaves.push(vfStave);
    }
  },
  measure: function(measure) {
    // one vexflow Stave corresponds to one measure
    var vfStave = new Vex.Flow.Stave(0, 0, 150);
    if(measure['@width']) {
      // in MusicXML measure width unit is one tenth of interline space
      vfStave.setWidth(measure['@width'] * (vfStave.getSpacingBetweenLines() / 10));
    }

    // set attributes for measure
    vfStave = editor.parse.attributes(measure['attributes'], vfStave);

    var vfStaveNote, vfStaveNotesPerMeasure = [];
    for(var i = 0; i < measure.note.length; i++) {
      vfStaveNote = editor.parse.note(measure.note[i]);
      vfStaveNotesPerMeasure.push(vfStaveNote);
    }
    vfStaveNotes.push(vfStaveNotesPerMeasure);

    return vfStave;
  },
  attributes: function(attributes, vfStave) {
    console.log(attributes);
    // with vfStave:
      // add/set Clef
      // add/set Key/Time Signature
    return vfStave;
  },
  note: function(note) {
    console.log(note);
    var vfStaveNote = new Vex.Flow.StaveNote({keys: ['c/4'], duration: 'q'});
    return vfStaveNote;
  }
}