window.onload = function() {

  fileInput.addEventListener('change', function(e) {
    // var xmlTextArea = document.getElementById('xmlTextArea');
    // clearViewer();
    var file = fileInput.files[0];

    if (file.type.match(/.xml/)) {  //TODO: make limit for file size also
      // $('#renderButton').show();
      // $('#clearButton').show();
      console.log('xml file type');      
      // $('#msgArea').html("");
      var reader = new FileReader();

      reader.onload = function(e) {             // after FileReader finishes reading:
        var xmlDoc = $.parseXML(reader.result); // parse xml using jQuery into xml document,
        //TODO: use xml2json and json2xml accordingly to it's license (LGPL 2.1)
        jsonFromXml = xml2json(xmlDoc, '  ');   // convert xml to json for faster access,
        scoreJson = $.parseJSON(jsonFromXml);   // load json to memory; parseJSON is safer than eval
        scoreJson = onlyChildren2Array(scoreJson);
      }

      reader.readAsText(file);
    }
    else {
      // $('#renderButton').hide();
      // $('#clearButton').hide();      
      console.log('Only XML files supported!');      
      // $('#msgArea').html("Only XML files supported!");
    }
  });
}

//wraps measure and note only child elements
//into one element arrays for later better manipulation

//TODO: fix it, doesn't work yet
function onlyChildren2Array(scoreJson) {
  if(! $.isArray(scoreJson["score-partwise"].part.measure) ) {  //or !(x instanceof Array)
    scoreJson["score-partwise"].part.measure = [ scoreJson["score-partwise"].part.measure ];
  }
  for (var i in scoreJson["score-partwise"].part.measure) {
    if(! $.isArray(scoreJson["score-partwise"].part.measure[i].note) ) {
      scoreJson["score-partwise"].part.measure[i].note = [ scoreJson["score-partwise"].part.measure[i].note ];
    }
  }
  return scoreJson;
}