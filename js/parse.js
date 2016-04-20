/*
performs transformation from scoreJson to vfStaves[] and vfStaveNotes[]
prepares vfStaves[] and vfStaveNotes[] for editor.draw.staves() function
*/
editor.parse = {
  all: function() {
    // clear global arrays
    vfStaves = [];
    vfStaveNotes = [];
    xmlAttributes = [];

    var vfStave;
    // loop over all <measures>(MusicXML measures) and make Vex.Flow.Staves from them
    for(var i = 0; i < scoreJson["score-partwise"].part[0].measure.length; i++) {
      vfStave = editor.parse.measure(scoreJson["score-partwise"].part[0].measure[i], i);

      vfStave = editor.parse.attributes(vfStave, i);

      // push measure to global array, draw() will read from it
      vfStaves.push(vfStave);
    }
  },

  measure: function(measure, index) {
    // one Vex.Flow.Stave corresponds to one <measure>
    var vfStave = new Vex.Flow.Stave(0, 0, editor.staveWidth);
    if(measure['@width']) {
      // in MusicXML measure width unit is one tenth of interline space
      vfStave.setWidth(measure['@width'] * (vfStave.getSpacingBetweenLines() / 10));
    }

    // push attributes for measure to global array of attributes for measures
    if(measure['attributes'])
      xmlAttributes.push(measure['attributes']);
    else
      xmlAttributes.push({});

    var vfStaveNote, vfStaveNotesPerMeasure = [];
    if(measure.note) {
      // loop over all notes in measure
      for(var i = 0; i < measure.note.length; i++) {
        vfStaveNote = editor.parse.note(measure.note[i], index, i);
        vfStaveNotesPerMeasure.push(vfStaveNote);
      }
      vfStaveNotes.push(vfStaveNotesPerMeasure);
    }
    else    // measure doesn't have notes
      vfStaveNotes.push([]);

    return vfStave;
  },

  attributes: function(vfStave, measureIndex) {
    // setting attributes for measure
    if(! $.isEmptyObject(xmlAttributes[measureIndex])) {
      attributes = xmlAttributes[measureIndex];

      if(attributes.clef) {
        if($.isArray(attributes.clef)) {
          console.warn("Multiple clefs for measure currently not supported.");
          var clef = attributes.clef[0];
        }
        else
          var clef = attributes.clef;

        var xmlClefType = clef.sign + '/' + clef.line;
        var vfClefType = editor.table.CLEF_TYPE_DICT[xmlClefType];
        vfStave.setClef(vfClefType);  
        editor.currentClef = vfClefType;
      }

      if(attributes.key) {
        if(attributes.key.fifths) {
          var fifths = +attributes.key.fifths;
          if(fifths == 0)
            keySpec = 'C';
          else if(fifths > 0)
            keySpec = editor.table.SHARP_MAJOR_KEY_SIGNATURES[fifths - 1];
          else
            keySpec = editor.table.FLAT_MAJOR_KEY_SIGNATURES[-fifths - 1];
          // var keySig = new Vex.Flow.KeySignature(keySpec);
          // keySig.addToStave(vfStave);
          vfStave.setKeySignature(keySpec);
          editor.currentKeySig = keySpec;
        }
      }

      if(attributes.time) {
        if($.isArray(attributes.time)) {
          console.warn("Multiple pairs of beats and beat-type elements in time signature not supported.");
          var time = attributes.time[0];
        }
        else
          var time = attributes.time;

        vfStave.setTimeSignature(time.beats + '/' + time['beat-type']);
      }
    }
    return vfStave;
  },

  note: function(note, measureIndex, noteIndex) {
    var rest = note.rest ? 'r' : '';
    if(note.pitch) {
      var key = note.pitch.step.toLowerCase() + '/' + note.pitch.octave;
      // since this project is yet not interested in how note sounds,
      // alter element is not needed; accidental is read from accidental element
    }
    //get MusicXML divisions from attributes for current measure
    var divisions = 1;
    for(var i = 0; i <= measureIndex; i++) {
      if(xmlAttributes[i].divisions !== undefined)
        divisions = xmlAttributes[i].divisions;
    }

    // get note length from divisions and duration
    var staveNoteDuration =
      editor.NoteTool.getStaveNoteTypeFromDuration(note.duration, divisions);

    //console.log(key+', '+'divisions:'+divisions
    //   +', '+'duration:'+note.duration+' -> '+staveNoteDuration);

    var vfStaveNote = new Vex.Flow.StaveNote({keys: [key], duration: staveNoteDuration});

    vfStaveNote.setId('m' + measureIndex + 'n' + noteIndex);   //set id for note DOM element in svg

    // currently support for only one dot
    // to support more dots, xml2json.js needs to be changed -
    // - currently it is eating up more dots:
    // e.g. from <dot/><dot/><dot/> it makes only one {dot: null}
    if(note.hasOwnProperty('dot')) {
      vfStaveNote.addDotToAll();
      console.log('dot');
    }

    if(note.accidental) {
      // accidental element can have attributes
      var mXmlAcc = (typeof note.accidental === 'string')
                      ? note.accidental : note.accidental['#text'];
      var vfAcc = editor.table.ACCIDENTAL_DICT[mXmlAcc];
      vfStaveNote.addAccidental(0, new Vex.Flow.Accidental(vfAcc));
      //console.log('acci: '+mXmlAcc+' -> '+vfAcc);
    }

    return vfStaveNote;
  }
}