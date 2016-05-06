editor.draw = {
  // clears svg and draws all measures (whole score) again
  score: function() {
    console.log('draw');

    var canvasWidth = document.getElementById('svg-wrapper').clientWidth;
    var canvasHeight = document.getElementById('svg-wrapper').clientHeight;
    $('#svg-container').attr('width', canvasWidth);

    // TODO resize ctx here and also on lines 43 - 49
    // editor.ctx.resize(canvasWidth, canvasHeight);
    editor.ctx.clear();
    // no cursor note will be displayed
    editor.selected.cursorNoteKey = null;

    // var minWidth = noteWidth * maxLength;
    var minWidth = editor.noteWidth * 4;

    var attributes = {};
    // var count = 0;
    var staveX = 10, staveY = 0;

    // loop over all measures
    for(var staveIndex = 0; staveIndex < vfStaves.length; staveIndex++) {

      var stave = vfStaves[staveIndex];

      var staveWidth = stave.getWidth();

      // calculate newline
      var staveEnd = staveX + staveWidth;
      if(staveEnd > canvasWidth) {
        staveX = 10;
        staveY = staveY + editor.staveHeight;
        newLine = true;
      }
      else {
        newLine = false;
      }

      // gradually extend height of canvas
      // if((staveY + editor.staveHeight) > $('#svg-container').attr('height'))
      //   $('#svg-container').attr('height', staveY + editor.staveHeight);

      // if one measure is wider than canvas(e.g. in Chant.xml), extend canvas
      if(staveWidth > $('#svg-container').attr('width'))
        $('#svg-container').attr('width', staveWidth);

      // set position and width of stave 
      stave.setX(staveX);
      stave.setY(staveY);
      // if measure doesn't have its own width(set as attribute in xml)
      // if(stave.getWidth() == editor.staveWidth)
      //   stave.setWidth(staveWidth);
      // else
        // staveWidth = stave.getWidth();

      // set rendering context for stave
      stave.setContext(editor.ctx);

      // clef and key signature must be rendered on every first measure on new line
      if(newLine === true || staveIndex === 0) {
        stave.setClef(editor.currentClef);
        stave.setKeySignature(editor.currentKeySig);
        if(!newLine) stave.setTimeSignature(editor.currentTimeSig);
        // number of accidentals in key signature
        var numOfAcc = editor.table.SHARP_MAJOR_KEY_SIGNATURES.indexOf(editor.currentKeySig) + 1;
        if(!numOfAcc)
          numOfAcc = editor.table.FLAT_MAJOR_KEY_SIGNATURES.indexOf(editor.currentKeySig) + 1;

        // TODO extend width of measure with clef | keysig | timesig
        // stave.setWidth(stave.getWidth() + 80 + numOfAcc * 20);
        // not good solution, it would grow after each draw call

      }
      // remove clef and key signature when not newline
      else {
        // vexflow extension
        stave.removeClef();
        stave.removeKeySignature();
      }


      editor.draw.measure(staveIndex, false);

      // set start x position for next measure
      staveX = staveX + staveWidth;

      // set height of canvas after last rendered measure
      if(staveIndex == vfStaves.length - 1)
        $('#svg-container').attr('height', staveY + editor.staveHeight);

    } // loop over measures

    // mouse events listeners on <rect> for selecting measures
    if(editor.mode === 'measure') {
      $('svg .measureRect').each(function() {
        attachListenersToMeasureRect($(this));
      });
      // highlight selected measure
      $('svg .measureRect#'+editor.selected.measure.id)
        .css({'fill': 'blue', 'opacity': '0.4'});
    }
    // highlight selected note
    else if(editor.mode === 'note')
      $('svg #vf-'+editor.selected.note.id).colourNote("red");

  },




  // removes particular measure(stave) from svg and draws it again
  measure: function(index, cursorNoteEnabled) {
    // $('#vf-mg'+index).empty();
    $('#vf-m'+index).remove();

    var stave = vfStaves[index];

    // svg measure group
    editor.ctx.openGroup("measure", "m"+index, {pointerBBox: true});
      // draw stave
      stave.draw();

      // create svg <rect> element exactly overlapping stave for stave selection and highlight
      editor.ctx.rect(stave.getX(),
                      stave.y,
                      stave.getWidth(),
                      editor.staveHeight,
                      {
                        'class': 'measureRect',
                        'id': 'm'+index,
                        'fill': 'transparent'
                      }
                    );

      // find time signature in Attributes for current Measure
      var beats = 4, beat_type = 4;
      for(var a = 0; a <= index; a++) {
        // finds attributes of closest previous measure or current measure
        if(! $.isEmptyObject(xmlAttributes[a]) && xmlAttributes[a].time) {
          beats = xmlAttributes[a].time.beats;
          beat_type = xmlAttributes[a].time['beat-type'];
        }
      }

      var voice = new Vex.Flow.Voice({
          num_beats: beats,
          beat_value: beat_type,
          resolution: Vex.Flow.RESOLUTION
        });

      voice.setStrict(false);    //TODO: let it be strict for check notes duration in measure

      voice.addTickables(vfStaveNotes[index]);

      //https://github.com/0xfe/vexflow/wiki/Automatic-Beaming:
      var beams = new Vex.Flow.Beam.generateBeams(vfStaveNotes[index], {
        groups: [new Vex.Flow.Fraction(beats, beat_type)]
      });

      var mnId = editor.selected.note.id;
      var selMeasureIndex = mnId.split('n')[0].split('m')[1];
      var selNoteIndex = mnId.split('n')[1];
      var selVFStaveNote = vfStaveNotes[selMeasureIndex][selNoteIndex];

      // draw the cursor note, if drawing selected measure and cursor note is enabled
      if(editor.mode === 'note' && +selMeasureIndex === index && cursorNoteEnabled) {
        var noteValue = getRadioValue('note-value');
        var dot = $('#dotted-checkbox').is(":checked") ? 'd' : '';
        // get note properties
        // var noteValue = selVFStaveNote.getDuration();     //w, h, q, 8, 16
        // var dot = selVFStaveNote.isDotted() ? 'd' : '';

        // create cursor note
        var cursorNote = new Vex.Flow.StaveNote({
          keys: [editor.selected.cursorNoteKey],
          duration: noteValue + dot,
          auto_stem: true
        });
        // console.log(cursorNote);
        if(dot === 'd') cursorNote.addDotToAll();

        cursorNote.setStave(stave);

        // create separate voice for cursor note
        var cursorNoteVoice = new Vex.Flow.Voice({
            num_beats: beats,
            beat_value: beat_type,
            resolution: Vex.Flow.RESOLUTION
          });
        cursorNoteVoice.setStrict(false);
        cursorNoteVoice.addTickables([cursorNote]);

        new Vex.Flow.Formatter()
          .joinVoices([voice, cursorNoteVoice])
          .format([voice, cursorNoteVoice], stave.getWidth() * 0.8);

        // cursor note is only note in its voice, so it is on place of the very first note
        // we need to shift it to selected note x position
        var xShift = selVFStaveNote.getX();
        // shift back by width of accidentals on left side of first note in measure
        xShift -= vfStaveNotes[index][0].getMetrics().modLeftPx;
        cursorNote.setXShift(xShift);

        cursorNoteVoice.draw(editor.ctx, stave);
      }
      // measure mode, no cursor note
      else {
        // format and justify the notes to 80% of staveWidth
        new Vex.Flow.Formatter()
          .joinVoices([voice])
          .format([voice], stave.getWidth() * 0.8);
        // also exists method formatToStave()...
        // but it is rather helper function I guess, like FormatAndDraw() in Voice
      }

      // draw normal voice always
      voice.draw(editor.ctx, stave);

      beams.forEach(function(beam) {
        beam.setContext(editor.ctx).draw();
      });

      // if last note is behind width of stave, extend stave
      // var lastNoteX = vfStaveNotes[m][vfStaveNotes[m].length - 1].getNoteHeadEndX();
      // if((lastNoteX - stave.getX()) > staveWidth) {
      //   console.log('stave['+m+'] extended, lastNoteX: '+lastNoteX+'staveWidth: '+staveWidth);
      //   stave.setWidth(lastNoteX + 10);
      //   stave.draw();
      // }
      // TODO rather create function calculateStaveWidth(stave())

    // svg measure group
    editor.ctx.closeGroup();

    // adding event listeners to note objects
    for(var n = 0; n < vfStaveNotes[index].length; n++){
      // adding listeners for interactivity: (from vexflow stavenote_tests.js line 463)
      // item is svg group: <g id="vf-m1n3" class="vf-stavenote">
      var item = vfStaveNotes[index][n].getElem();
      attachListenersToNote(item);
      // var noteBBox = vfStaveNotes[index][n].getBoundingBox();
      // noteBBox.draw(editor.ctx);
    }

  },

  selectedMeasure: function(cursorNoteEnabled) {
    var measureIndex = 0;
    // get measure index from id of selected object
    if(editor.mode === 'note')
      measureIndex = +editor.selected.note.id.split('n')[0].split('m')[1];
    else if(editor.mode === 'measure')
      measureIndex = +editor.selected.measure.id.split('m')[1];

    console.log('redraw measure['+measureIndex+']');

    editor.draw.measure(measureIndex, cursorNoteEnabled);

    // highlight selected note
    if(editor.mode === 'note')
      $('svg #vf-'+editor.selected.note.id).colourNote("red");
  }

}