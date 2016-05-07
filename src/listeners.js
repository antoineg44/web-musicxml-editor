// $("#control-panel")[0].addEventListener('click', editor.draw.score);
// $("#editor-tabs")[0].addEventListener('click', editor.draw.score);

// editor.svgElem.addEventListener('click', editor.select.measure);
// editor.svgElem.addEventListener('click', editor.select.note);
// editor.svgElem.addEventListener('click', editor.add.note);
// editor.svgElem.addEventListener('mousemove', redraw);

debouncedResize = null;
$(window).resize(function() {
  if (! debouncedResize)
    debouncedResize = setTimeout(function() {
      editor.draw.score();
      debouncedResize = null;
    }, 50);
});
// $(window).resize(editor.draw.score);

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
      editor.selected.note.previousId = editor.selected.note.id;
      editor.selected.note.id = $(this).attr('id') + 'n0';
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
      // don't change colour of already selected note
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
        // highlight properties on control panel accordingly
        var vfStaveNote = getSelectedNote();
        if(vfStaveNote.getAccidentals())
          var accOfSelNote = vfStaveNote.getAccidentals()[0].type;
        // uncheck already checked radio button
        $("input:radio[name='note-accidental']:checked").prop("checked", false);
        // set radio button for accidental of selected note
        if(accOfSelNote)
          $("input:radio[name='note-accidental'][value='"+accOfSelNote+"']").prop("checked", true);
        var durOfSelNote = vfStaveNote.getDuration();
        $("input:radio[name='note-value'][value='"+durOfSelNote+"']").prop("checked", true);
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

// setting/removing accidental to/from note via radio buttons
$("input:radio[name='note-accidental']").on("click",function() {
  var radio = $(this);

  // get selected note
  var selNote = getSelectedNote();

  // don't set accidental for rest
  if(selNote.isRest()) {
    // uncheck this checked radio button after while
    setTimeout(function() {
      $("input:radio[name='note-accidental']:checked").prop("checked", false);     
    }, 50);
    return;
  }

  // radio already checked, uncheck it
  if(radio.is(".selAcc")) {
    console.log('uncheck');
    radio.prop("checked",false).removeClass("selAcc");
    selNote.removeAccidental();
  }
  // radio unchecked, check it
  else {
    console.log('check');
    $("input:radio[name='"+radio.prop("name")+"'].selAcc").removeClass("selAcc");
    radio.addClass("selAcc");
    var vexAcc = $(this).prop("value");
    console.log($(this).prop("value"));
    selNote.setAccidental(0, new Vex.Flow.Accidental(vexAcc));
  }
  editor.draw.selectedMeasure();
});

$("input:radio[name='note-value']").on("change",function() {
  editor.edit.noteDuration();
  editor.draw.selectedMeasure();
});


// TODO move elsewhere
// called at start of whole program

// uncheck checked accidental radio button
$("input:radio[name='note-accidental']:checked").prop("checked", false);
// uncheck note-value radio button
$("input:radio[name='note-value']:checked").prop("checked", false);
// check whole note radio button
$("input:radio[name='note-value'][value='w']").prop("checked", true);

editor.parse.all();
editor.draw.score();
switchToNoteMode();