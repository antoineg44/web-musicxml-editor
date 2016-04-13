$("#control-panel")[0].addEventListener('click', editor.draw.staves);

editor.canvas.addEventListener('click', editor.select.measure);
editor.canvas.addEventListener('click', editor.select.note);
editor.canvas.addEventListener('click', editor.add.note);
editor.canvas.addEventListener('click', redrawSelect, true);
editor.canvas.addEventListener('mousemove', redraw);
editor.canvas.addEventListener('mousemove', getMousePos);
editor.canvas.addEventListener('mousemove', returnInsertNote);

function redraw() {
  //redraw on mousemove only when adding new note
  if(editor.getRadioValue('tools') == 'add')
    editor.draw.staves();
}
function redrawSelect() {
  //redraw on mousemove only when adding new note
  if(editor.canRedraw)
    editor.draw.staves();
}


function getMousePos(evt){
    editor.mousePos = editor.select.getMousePos(editor.canvas, evt);
}

function returnInsertNote(){
  editor.selected.insertNote = editor.getInsertNote();
}

editor.draw.staves();
