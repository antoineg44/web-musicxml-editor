// editor.draw = {
//   staves: function(){
//     vfStaves = [];
//     var noteValue = editor.getRadioValue('note-value');
//     var selectOrAdd = editor.getRadioValue('tools');

//     // editor.ctx.clearRect(0, 0, editor.canvas.width, editor.canvas.height);
//     editor.ctx.clear();
//     canvasWidth = document.getElementById('canvas-wrapper').clientWidth;
//     $('#notation-canvas').attr('width', canvasWidth);

//     var notesPerMeasureLengths = [];
//     for (var i in scoreJson["score-partwise"].part.measure) {
//       var measure = scoreJson["score-partwise"].part.measure[i];
//       if (measure.note)
//         notesPerMeasureLengths.push(measure.note.length);
//       else
//         notesPerMeasureLengths.push(1);
//     }

//     //find max number of notes in measure
//     notesPerMeasureLengths.sort(function(a,b){return b-a;});
//     var maxLength = notesPerMeasureLengths[0];
//     var noteWidth = 40;
//     var minWidth = noteWidth * maxLength;



//     var attributes = {};
//     var count = 0;
//     var staveX = 10, staveY = 0;

//     // draw the staves
//     for (var i in scoreJson["score-partwise"].part.measure) {
//       // find line break points
//       for(var br=6; br>=0; br--){
//         if(canvasWidth / br >= minWidth){
//           var staveWidth = canvasWidth / br - 10;
//           break;
//         }
//       }

//       var staveEnd = staveX + staveWidth;
//       if(staveEnd > canvasWidth){
//         staveX = 10;
//         staveY = staveY + editor.staveHeight;
//         newLine = true;
//       }
//       else{
//         newLine = false;
//       }
//       staveX = staveX + staveWidth;

//       var stave = new Vex.Flow.Stave(staveX - staveWidth, staveY, staveWidth);
//       vfStaves.push(stave);

//       var measure = scoreJson["score-partwise"].part.measure[i];
//       if (measure['attributes']) {
//         attributes = measure['attributes'];
//       }

//       // console.log(obj);
//     }
//   }
// }

editor.draw = {
  staves: function(){
    console.log('draw');
    var noteValue = editor.getRadioValue('note-value');
    var selectOrAdd = editor.getRadioValue('tools');

    // editor.ctx.clearRect(0, 0, editor.canvas.width, editor.canvas.height);
    editor.ctx.clear();
    canvasWidth = document.getElementById('canvas-wrapper').clientWidth;
    $('#notation-canvas').attr('width', canvasWidth);

    // render the selected measure border
    // yellow fill on doubleClick
    if(editor.selected.measure.doubleClick === true){
      editor.ctx.rect(editor.selected.measure.x, editor.selected.measure.y, editor.selected.measure.width, editor.selected.measure.height);
      editor.ctx.fillStyle = '#FFF7D9';
        editor.ctx.fill();  //TODO: fill method from SVGContext needs attributes
        editor.ctx.lineWidth = 0;
        editor.ctx.strokeStyle = '#FFF7D9';
      editor.ctx.stroke();
      console.log('first');
    }
    //gray fill on single click
    else{
      editor.ctx.rect(editor.selected.measure.x, editor.selected.measure.y, editor.selected.measure.width, editor.selected.measure.height);
        editor.ctx.fillStyle = '#F0F0F0';
        editor.ctx.fill();  //TODO: fill method from SVGContext needs attributes
        editor.ctx.lineWidth = 0;
        editor.ctx.strokeStyle = '#F0F0F0';
      editor.ctx.stroke();
      console.log('second');
    }
    //black border on doubleClick
    if(editor.selected.measure.doubleClick === true){
      editor.ctx.strokeStyle = 'black';
      editor.ctx.rect(editor.selected.note.x, editor.selected.note.y, editor.selected.note.width, editor.selected.note.height);
      editor.ctx.stroke();
      console.log('third');
    }
    editor.ctx.fillStyle = 'black';
    editor.ctx.strokeStyle = 'black';

    // find the min-width needed for a measure
    var voiceLengths = [];
    for(i=0; i<editor.measures.length; i++){
      var noteCount = 0;
      // find the longest voice
      if(editor.measures[i].hasOwnProperty('v1')){
        noteCount = editor.measures[i].v1.length;
        voiceLengths.push(noteCount);
      }
    }

    if(voiceLengths.length >= 1){
      voiceLengths.sort(function(a,b){return b-a;});
      maxLength = voiceLengths[0];
      var noteWidth = 40;
      var minWidth = noteWidth * maxLength;
    }else{
      minWidth = 40;
    }

    var count = 0;

    var staveX = 10;
    var staveY = 0;

    // draw the staves
    // console.log($xml.find("measure").length);
    for(i=0; i<editor.measures.length; i++){

      // find line break points
      for(br=6; br>=0; br--){
        if(canvasWidth / br >= minWidth){
          var staveWidth = canvasWidth / br - 10;
          break;
        }
      }

      var staveEnd = staveX + staveWidth;
      if(staveEnd > canvasWidth){
        staveX = 10;
        staveY = staveY + editor.staveHeight;
        newLine = true;
      }else{
        newLine = false;
      }

      staveX = staveX + staveWidth;

      editor.measures[i].measure = i + 1;
      editor.measures[i].width = staveWidth;  
      editor.measures[i].x = staveX - staveWidth;
      editor.measures[i].y = staveY;
      editor.measures[i].height = editor.staveHeight;

      var stave = new Vex.Flow.Stave(editor.measures[i].x, editor.measures[i].y, editor.measures[i].width);


      if(editor.measures[i].clef != null){
        stave.addClef(editor.measures[i].clef).setContext(editor.ctx);  
        var currentClef = editor.measures[i].clef;
      }else{
        //stave.setContext(editor.ctx);
      }

      if(editor.measures[i].keySig != null){
        var keySig = new Vex.Flow.KeySignature(editor.measures[i].keySig);
        keySig.addToStave(stave);
        var currentKeySig = editor.measures[i].keySig;
      }

      if(newLine == true){
        stave.addClef(currentClef).setContext(editor.ctx);  
        var keySig = new Vex.Flow.KeySignature(currentKeySig);
        keySig.addToStave(stave);
      }

      if(editor.measures[i].showTimeSig == true){
        stave.addTimeSignature(editor.measures[i].timeSigTop + '/' + editor.measures[i].timeSigBottom);
      }

      stave.setContext(editor.ctx).draw();

      //draw the notes
      //TODO: replace notes1 by local variable, it's useless as a global
      editor.notes1 = [];

      if(editor.measures[i].hasOwnProperty('v1')){
        for(n=0; n<editor.measures[i].v1.length; n++){

          var accidental = editor.measures[i].v1[n].accidental;
          var dotted = editor.measures[i].v1[n].dotted;

          var note = new Vex.Flow.StaveNote(editor.measures[i].v1[n]);
          if (accidental != null) note.addAccidental(0, new Vex.Flow.Accidental(accidental));
          if (dotted == true) note.addDotToAll();
          var noteId = 'm' + i + 'n' + n;   //identification for note, n.o. of measure and note in it
          note.setId(noteId);   //set id for note DOM element in svg
          editor.notes1.push(note);
          
          editor.measures[i].v1[n].x = editor.notes1[n].note_heads[0].x;
          editor.measures[i].v1[n].y = editor.notes1[n].note_heads[0].y;
        
        }

        var voice1 = new Vex.Flow.Voice({
            num_beats: editor.measures[i].timeSigTop,
            beat_value: editor.measures[i].timeSigTop,    //TODO: is it correct? change it to time SigBottom
            resolution: Vex.Flow.RESOLUTION
          });

        voice1.setStrict(false);    //TODO: let it be strict for check notes duration in measure

        // draw the cursor note
        if(i == editor.selected.measure.selection - 1 && selectOrAdd == 'add'){
            editor.notes1.push(new Vex.Flow.StaveNote(
            {
              keys: [editor.selected.insertNote],
              duration: noteValue,
            }
          )); 
        }

          voice1.addTickables(editor.notes1);


        // This is only helper function to justify and draw a 4/4 voice
        // TODO: replace it with something like: voice.draw(ctx, stave);
        Vex.Flow.Formatter.FormatAndDraw(editor.ctx, stave, editor.notes1);

        //https://github.com/0xfe/vexflow/wiki/Automatic-Beaming:
        var beams = new Vex.Flow.Beam.generateBeams(editor.notes1, {
          groups: [new Vex.Flow.Fraction(4, 8)]
        });

        // if(editor.frameCount % 30 == 0){
        //   console.log(editor.notes1); 
        // }
        
        beams.forEach(function(beam) {
          beam.setContext(editor.ctx).draw();
        });

        for(n=0; n<editor.measures[i].v1.length; n++){
          if(editor.notes1[n] != undefined){
            if(editor.measures[i].v1[n].keys != null){
              // adds x and y positoins to the staves notes
              editor.measures[i].v1[n].x = editor.notes1[n].note_heads[0].x;
              editor.measures[i].v1[n].y = editor.notes1[n].note_heads[0].y;  
            } 

            //adding handlers for interactivity: (from vexflow stavenote_tests.js line 463)
            var item = editor.notes1[n].getElem();
            item.addEventListener("mouseover", function() {
              Vex.forEach($(this).find("*"), function(child) {
                child.setAttribute("fill", "green");
                child.setAttribute("stroke", "green");
              });
            }, false);
            item.addEventListener("mouseout", function() {
              Vex.forEach($(this).find("*"), function(child) {
                child.setAttribute("fill", "black");
                child.setAttribute("stroke", "black");
              });
              editor.canRedraw = true;
            }, false);
            item.addEventListener("click", function() {
              Vex.forEach($(this).find("*"), function(child) {
                //TODO: unset class selected-note from previous selected note
                //and set class selected-note to this one
                //note styling will be based on the class
                //OR: set class or styling based on editor.selected.note
                child.setAttribute("class", "selected-note");
                child.setAttribute("fill", "red");
                child.setAttribute("stroke", "red");
              });
              //id='vf-m1n3' - fourth note in second measure
              var selectIds = $(this).attr('id').split('m')[1].split('n');
              editor.mySelect.measure = +selectIds[0];
              editor.mySelect.note = +selectIds[1];
              console.log(editor.mySelect);
              editor.canRedraw = false;
            }, false);
          }
        }
      }
      count++;
    }
  }
}
