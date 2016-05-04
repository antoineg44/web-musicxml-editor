// $("#control-panel")[0].addEventListener('click', editor.draw.score);
$("#editor-tabs")[0].addEventListener('click', editor.draw.score);

// editor.canvas.addEventListener('click', editor.select.measure);
// editor.canvas.addEventListener('click', editor.select.note);
// editor.canvas.addEventListener('click', editor.add.note);
// editor.canvas.addEventListener('mousemove', redraw);

function redraw(event) {
  //redraw on mousemove only in note mode when adding new note
  // if(editor.mode === 'note' && getRadioValue('tools') == 'add') {
    // get mouse position
    editor.mousePos = editor.select.getMousePos(editor.canvas, event);
    // save previous cursor note for latter comparison
    editor.lastCursorNote = editor.selected.insertNote;
    // get new note below mouse cursor
    editor.selected.insertNote = getInsertNote();
    // redraw only when cursor note changed pitch
    // (mouse changed y position between staff lines/spaces)
    if(editor.lastCursorNote !== editor.selected.insertNote)
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
    if(editor.mySelect.measure.id !== $(this).attr('id')) {
      // save currently selected id to previous
      editor.mySelect.measure.previousId = editor.mySelect.measure.id;
      editor.mySelect.measure.id = $(this).attr('id');
      var prevId = editor.mySelect.measure.previousId;
      $('svg .measureRect#'+prevId).css({'fill': 'transparent'});
      $('svg .measureRect#'+editor.mySelect.measure.id)
        .css({'fill': 'blue', 'opacity': '0.4'});
    }
  });
  measureRectElem.on('mouseenter', function() {
    if(editor.mySelect.measure.id !== $(this).attr('id'))
      $(this).css({'fill': 'blue', 'opacity': '0.1'}); 
  });
  measureRectElem.on('mouseleave', function() {
    if(editor.mySelect.measure.id !== $(this).attr('id'))
      $(this).css({'fill': 'transparent'}); 
  });
}

function attachListenersToNote(noteElem) {
  noteElem.addEventListener("mouseover", function() {
    // if editor is in mode for working with notes
    if(editor.mode === 'note') {
      // we don't want to change colour of already selected note
      if(editor.mySelect.note.id !== $(this).attr('id').split('-')[1]) {
        // change colour for each note parts - stem, head, dot, accidental...
        $(this).colourNote("orange");
      }
    }
  }, false);

  noteElem.addEventListener("mouseout", function() {
    if(editor.mode === 'note') {
      if(editor.mySelect.note.id !== $(this).attr('id').split('-')[1]) {
        $(this).colourNote("black");
      }
    }
  }, false);

  noteElem.addEventListener("click", function() {
    if(editor.mode === 'note') {
      // if it is not second click on already selected note
      if(editor.mySelect.note.id !== $(this).attr('id').split('-')[1]) {
        $(this).colourNote("red");
        // save currently selected id to previous
        editor.mySelect.measure.previousId = editor.mySelect.measure.id;
        editor.mySelect.note.previousId = editor.mySelect.note.id;
        // format of id: id='vf-m13n10' - eleventh note in fourteenth measure(indexing from 0)
        var mnId = $(this).attr('id');
        // save id of newly selected note
        editor.mySelect.measure.id = mnId.split('n')[0].split('m')[1];  // '13'
        editor.mySelect.note.id = mnId.split('-')[1];                   // 'm13n10'
        // unhighlight previous selected note
        $('svg #vf-'+editor.mySelect.note.previousId).colourNote("black");
        console.log(editor.mySelect.note);
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