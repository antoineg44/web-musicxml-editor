function switchToNoteMode() {
  editor.mode = 'note';
  // TODO start listening to mousemove on svg-container
  // get mouse position,
    // if mouse is in selected REST column (currently no support for chords)
    // (something like TickContext - see https://github.com/0xfe/vexflow/wiki/How-Formatting-Works),
    // but only within its own stave/voice
      // render note on cursor
      // after click replace selected rest with cursor note and highlight it

  editor.svgElem.addEventListener('mousemove', redrawMeasureWithCursorNote, false);
}

function redrawMeasureWithCursorNote(event) {
  // redraw on mousemove only in note mode when adding new note
  // get mouse position
  editor.mousePos = getMousePos(editor.svgElem, event);

  // get selected measure and note
  var mnId = editor.selected.note.id;
  var measureIndex = mnId.split('n')[0].split('m')[1];
  var noteIndex = mnId.split('n')[1];
  var vfStaveNote = vfStaveNotes[measureIndex][noteIndex];
  var vfStave = vfStaves[measureIndex];

  var bb = vfStave.getBoundingBox();
  var begin = vfStaveNote.getNoteHeadBeginX() - 5;
  bb.setX(begin);
  bb.setW(vfStaveNote.getNoteHeadEndX() - begin + 5);
  // bb.setW(20);
  bb.draw(editor.ctx);

  if(isCursorWithinRectangle( bb.getX(), bb.getY(), bb.getW(), bb.getH(),
                              editor.mousePos.x, editor.mousePos.y ) ) {
    editor.draw.selectedMeasure();
  }

  // save previous cursor note for latter comparison
  // editor.lastCursorNote = editor.selected.insertNoteKey;
  // get new note below mouse cursor
  // editor.selected.insertNoteKey = getinsertNoteKey();
  // redraw only when cursor note changed pitch
  // (mouse changed y position between staff lines/spaces)
  // if(editor.lastCursorNote !== editor.selected.insertNoteKey)
    // editor.draw.selectedMeasure();
}

function switchToMeasureMode() {
  editor.mode = 'measure';
  editor.svgElem.removeEventListener('mousemove', redrawMeasureWithCursorNote, false);
}


function getMousePos(canvas, evt) {
var rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

function getRadioValue(name) {
  var radios = document.getElementsByName(name);
  for(var i = 0; i < radios.length; i++){
    if(radios[i].checked){
      return radios[i].value;
      break;
    }
  }
}

/*
TODO: documentary comment...
*/
function getinsertNoteKey(evt) {
  // find the mouse position and return the correct note for that position.
  var y = vfStaves[editor.selected.measure.id.split('m')[1]].y;
  // var y = editor.selected.measure.y;
  var notesArray = ['c/','d/','e/','f/','g/','a/','b/'];
  var count = 0;

  var checkboxValue = $('#dotted-checkbox').is(":checked");
  var d = checkboxValue ? 'd' : '';

  for(var i = 5; i >= 0; i--){
    for(var l = 0; l < notesArray.length; l++){
      var noteOffset = (count * 35) - (l * 5 - 17);
      if(editor.mousePos.y >= y + noteOffset && editor.mousePos.y <= 5 + y + noteOffset){
        var insertNoteKey = notesArray[l] + (i+1) + d;
        var found = true;
        break;
      }
      if(found == true){
        break;
      }
    }
    count++;
  }
  return insertNoteKey;
}

// author Andre Bakker, VexUI: https://github.com/andrebakker/VexUI
function isCursorWithinRectangle(x, y, width, height, mouseX, mouseY) {
  if(mouseX > x && mouseX < x + width && mouseY > y && mouseY < y + height) {
    return true;
  }
  return false;
};

/**
 * @param obj1 The first object
 * @param obj2 The second object
 * @returns A new object representing the merged objects. If both objects passed as param have the same prop, then obj2 property is returned.
 */
// author Andre Bakker, VexUI: https://github.com/andrebakker/VexUI
function mergeProperties(obj1, obj2){
  var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
}

// or use this from vexflow:

// Merge `destination` hash with `source` hash, overwriting like keys
// in `source` if necessary.
// function mergeProperties(destination, source) {
//   for (var property in source)
//     destination[property] = source[property];
//   return destination;
// };