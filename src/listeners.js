// $("#control-panel")[0].addEventListener('click', editor.draw.score);
$("#editor-tabs")[0].addEventListener('click', editor.draw.score);

// editor.svgElem.addEventListener('click', editor.select.measure);
// editor.svgElem.addEventListener('click', editor.select.note);
// editor.svgElem.addEventListener('click', editor.add.note);
// editor.svgElem.addEventListener('mousemove', redraw);

function redraw(event) {
  //redraw on mousemove only in note mode when adding new note
  // if(editor.mode === 'note' && getRadioValue('tools') == 'add') {
    // get mouse position
    editor.mousePos = editor.select.getMousePos(editor.svgElem, event);
    // save previous cursor note for latter comparison
    editor.lastCursorNote = editor.selected.insertNoteKey;
    // get new note below mouse cursor
    editor.selected.insertNoteKey = getInsertNoteKey();
    // redraw only when cursor note changed pitch
    // (mouse changed y position between staff lines/spaces)
    if(editor.lastCursorNote !== editor.selected.insertNoteKey)
      editor.draw.score();
  // }
}

function attachListenersToMeasureRect(measureRectElem) {
  // to avoid multiple handlers attachment
  if(measureRectElem.data('handlers-added'))
    return true;
  measureRectElem.data('handlers-added', true);

  measureRectElem.on('click', function() {
    $(this).css({'fill': 'blue', 'opacity': '0.4'});
    console.log($(this).attr('id'));
    // if it is not second click on already selected measure
    if(editor.selected.measure.id !== $(this).attr('id')) {
      // save currently selected id to previous
      editor.selected.measure.previousId = editor.selected.measure.id;
      editor.selected.measure.id = $(this).attr('id');
      var prevId = editor.selected.measure.previousId;
      $('svg .measureRect#'+prevId).css({'fill': 'transparent'});
      $('svg .measureRect#'+editor.selected.measure.id)
        .css({'fill': 'blue', 'opacity': '0.4'});
    }
  });
  measureRectElem.on('mouseenter', function() {
    if(editor.selected.measure.id !== $(this).attr('id'))
      $(this).css({'fill': 'blue', 'opacity': '0.1'}); 
  });
  measureRectElem.on('mouseleave', function() {
    if(editor.selected.measure.id !== $(this).attr('id'))
      $(this).css({'fill': 'transparent'}); 
  });
}

function attachListenersToNote(noteElem) {
  noteElem.addEventListener("mouseover", function() {
    // if editor is in mode for working with notes
    if(editor.mode === 'note') {
      // we don't want to change colour of already selected note
      if(editor.selected.note.id !== $(this).attr('id').split('-')[1]) {
        // change colour for each note parts - stem, head, dot, accidental...
        $(this).colourNote("orange");
      }
    }
  }, false);

  noteElem.addEventListener("mouseout", function() {
    if(editor.mode === 'note') {
      if(editor.selected.note.id !== $(this).attr('id').split('-')[1]) {
        $(this).colourNote("black");
      }
    }
  }, false);

  noteElem.addEventListener("click", function() {
    if(editor.mode === 'note') {
      // if it is not second click on already selected note
      if(editor.selected.note.id !== $(this).attr('id').split('-')[1]) {
        $(this).colourNote("red");
        // save currently selected id to previous
        editor.selected.measure.previousId = editor.selected.measure.id;
        editor.selected.note.previousId = editor.selected.note.id;
        // format of id: id='vf-m13n10' - eleventh note in fourteenth measure(indexing from 0)
        var mnId = $(this).attr('id');
        // save id of newly selected note
        editor.selected.measure.id = mnId.split('-')[1].split('n')[0];  // 'm13'
        editor.selected.note.id = mnId.split('-')[1];                   // 'm13n10'
        // unhighlight previous selected note
        $('svg #vf-'+editor.selected.note.previousId).colourNote("black");
        console.log(editor.selected.note);
      }
    }
  }, false);

}

jQuery.fn.colourNote = function (colour) {
  Vex.forEach(this.find("*"), function(child) {
    child.setAttribute("fill", colour);
    child.setAttribute("stroke", colour);
  });
  return this;
}

// TODO move elsewhere
// called at start of whole program
editor.parse.all();
editor.draw.score();