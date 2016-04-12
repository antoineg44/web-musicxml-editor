editor.select = {
  getMousePos: function(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  },
  measure: function(){    
    for(i=0; i<editor.measures.length; i++){
      var width = editor.measures[i].width;
      var height = editor.measures[i].height;
      var xStart = editor.measures[i].x;
      var yStart = editor.measures[i].y;
      var xEnd = xStart + width;
      var yEnd = yStart + height;

      /* Start point[xStart, yStart] is on top-left
       * End point[xEnd, yEnd] is on bottom-right
       */

      //if clicked on measure
      if(editor.mousePos.x >= xStart && editor.mousePos.x <= xEnd &&
         editor.mousePos.y >= yStart && editor.mousePos.y <= yEnd) {

        //if clicked second time on already(previously) selected measure
        if(editor.mousePos.x >= editor.selected.measure.x
        && editor.mousePos.x <= editor.selected.measure.x + editor.selected.measure.width
        && editor.mousePos.y >= editor.selected.measure.y
        && editor.mousePos.y <= editor.selected.measure.y + editor.selected.measure.height
        ){
          editor.selected.measure.doubleClick = true;
          editor.selected.measure.previousSelection = editor.selected.measure.selection;
        }
        else {
          editor.selected.note.selection = null;
          editor.selected.note.clicked = false;
          editor.selected.measure.doubleClick = false;
          editor.selected.measure.previousSelection = editor.selected.measure.selection;
        }

        editor.selected.measure.selection = editor.measures[i].measure;
        editor.selected.measure.x = xStart;
        editor.selected.measure.y = yStart;
        editor.selected.measure.width = width;
        editor.selected.measure.height = height;
        break;
      }
    }
  },
  note: function(evt){
    var noteSelected = false;
    var toolValue = editor.getRadioValue('tools');

    if(toolValue == 'select' ){
      var noteVoice = 'v1';
    
      if(editor.measures[editor.selected.measure.selection - 1].hasOwnProperty(noteVoice)){
        // loop through notes
        for(n=0; n<editor.measures[editor.selected.measure.selection - 1][noteVoice].length; n++){
          if(editor.mousePos.x >= editor.measures[editor.selected.measure.selection - 1][noteVoice][n].x
          && editor.mousePos.x <= editor.measures[editor.selected.measure.selection - 1][noteVoice][n].x + 10 
          && editor.mousePos.y >= editor.measures[editor.selected.measure.selection - 1][noteVoice][n].y - 5
          && editor.mousePos.y + 5 <= editor.measures[editor.selected.measure.selection - 1][noteVoice][n].y + 10
          ){
            editor.selected.note.selection = n;
            editor.selected.note.clicked = true;
            editor.selected.note.x = editor.measures[editor.selected.measure.selection - 1][noteVoice][n].x - 10;
            editor.selected.note.y = editor.measures[editor.selected.measure.selection - 1][noteVoice][n].y - 15;
            editor.selected.note.width = 30;
            editor.selected.note.height = 30;
            var selectedNote = true;

            // Set the value of the dotted checkbox accordingly
            var selectedMeasure = editor.selected.measure.selection - 1;
            var checkboxValue = $('#dotted-checkbox').is(":checked");
            var isSelectedNoteDotted = editor.measures[selectedMeasure][noteVoice][editor.selected.note.selection].dotted;

            if(isSelectedNoteDotted == true){
              $('#dotted-checkbox').prop('checked', true);
            }else{
              $('#dotted-checkbox').prop('checked', false);
            }

            break;
          }else{
            var selectedNote = false;
            editor.selected.note.selection = null;
            editor.selected.note.clicked = false;
          }
        }
      }
      if(selectedNote == true){
        editor.selected.note.voice = 'v1';
        // break;
      }
    }
  }
}
