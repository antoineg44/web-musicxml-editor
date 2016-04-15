/*
performs transformation from scoreJson to vfStaves[] and vfStaveNotes[]
*/
editor.parse = {
  all: function() {
    // clear global arrays
    vfStaves = [];
    vfStaveNotes = [];
    mXmlMeasAttr = [];

    var vfStave;
    // loop over all <measures>(MusicXML measures) and make Vex.Flow.Staves from them
    for(var i = 0; i < scoreJson["score-partwise"].part[0].measure.length; i++) {
      vfStave = editor.parse.measure(scoreJson["score-partwise"].part[0].measure[i], i);
      vfStaves.push(vfStave);
    }
  },

  measure: function(measure, index) {
    // one Vex.Flow.Stave corresponds to one <measure>
    var vfStave = new Vex.Flow.Stave(0, 0, 150);
    if(measure['@width']) {
      // in MusicXML measure width unit is one tenth of interline space
      vfStave.setWidth(measure['@width'] * (vfStave.getSpacingBetweenLines() / 10));
    }

    // push attributes for measure to global array of attributes for measures
    if(measure['attributes'])
      mXmlMeasAttr.push(measure['attributes']);
    else
      mXmlMeasAttr.push({});

    var vfStaveNote, vfStaveNotesPerMeasure = [];
    if(measure.note) {
      // loop over all notes in measure
      for(var i = 0; i < measure.note.length; i++) {
        vfStaveNote = editor.parse.note(measure.note[i], index);
        vfStaveNotesPerMeasure.push(vfStaveNote);
      }
      vfStaveNotes.push(vfStaveNotesPerMeasure);
    }
    else    // measure doesn't have notes
      vfStaveNotes.push([]);

    return vfStave;
  },

  note: function(note, measureIndex) {
    var rest = note.rest ? 'r' : '';
    if(note.pitch) {
      var key = note.pitch.step.toLowerCase() + '/' + note.pitch.octave;
      // since this project is yet not interested in how note sounds,
      // alter element is not needed; accidental is read from accidental element
    }
    //get MusicXML divisions from attributes for current measure
    var divisions = 1;
    for(var i = 0; i <= measureIndex; i++) {
      if(mXmlMeasAttr[i].divisions !== undefined)
        divisions = mXmlMeasAttr[i].divisions;
    }

    // get note length from divisions and duration
    var staveNoteDuration =
      editor.NoteTool.getStaveNoteTypeFromDuration(note.duration, divisions);

    // console.log(key+', '+'divisions:'+divisions
    //   +', '+'duration:'+note.duration+' -> '+staveNoteDuration);

    var vfStaveNote = new Vex.Flow.StaveNote({keys: [key], duration: staveNoteDuration});




    // TODO :
    // add dot(s) and accidental to note; maybe set stem direction too




    return vfStaveNote;
  }
}