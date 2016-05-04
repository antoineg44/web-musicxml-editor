function switchToNoteMode() {
  editor.mode = 'note';
}

function switchToMeasureMode() {
  editor.mode = 'measure';
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
function getInsertNote(evt) {
  // find the mouse position and return the correct note for that position.
  var y = vfStaves[editor.mySelect.measure.id[1]].y;
  // var y = editor.selected.measure.y;
  var notesArray = ['c/','d/','e/','f/','g/','a/','b/'];
  var count = 0;

  var checkboxValue = $('#dotted-checkbox').is(":checked");
  var d = checkboxValue ? 'd' : '';

  for(var i = 5; i >= 0; i--){
    for(var l = 0; l < notesArray.length; l++){
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
}