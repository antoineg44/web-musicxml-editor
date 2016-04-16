window.onload = function() {

  fileInput.addEventListener('change', function(e) {
    // var xmlTextArea = document.getElementById('xmlTextArea');
    // clearViewer();
    try {
      var file = fileInput.files[0];
      var maxFileSize = 2 * 1024 * 1024;    // 2 MB

      if(fileInput.files[0].size > maxFileSize)
        throw 'Uploaded file size exceeded is bigger than 2MB.';

      if (file.type.match(/.xml/)) {  //TODO: make limit for file size also
        // $('#renderButton').show();
        // $('#clearButton').show();
        console.log('xml file Uploaded');      
        // $('#msgArea').html("");
        var reader = new FileReader();

        reader.onload = function(e) {             // after FileReader finishes reading:
          try {
            var xmlDoc = $.parseXML(reader.result); // parse xml using jQuery into xml document,
            //TODO: check, if xmlDoc is MusicXML, if root element name is score-partwise
            if(xmlDoc.documentElement.nodeName !== "score-partwise")
              throw 'Uploaded file is not MusicXML file.';
            //TODO: use xml2json and json2xml accordingly to it's license (LGPL 2.1)
            jsonFromXml = xml2json(xmlDoc, '  ');   // convert xml to json for faster access,
            scoreJson = $.parseJSON(jsonFromXml);   // load json to memory; parseJSON is safer than eval
            scoreJson = onlyChildren2Array(scoreJson);
          }
          catch(err) {
            console.exception(err);
          }
        }

        reader.readAsText(file);

      }
      else {
        // $('#renderButton').hide();
        // $('#clearButton').hide();      
        throw 'Uploaded file is not XML file.';      
        // $('#msgArea').html("Only XML files supported!");
      }
    }
    catch(err) {
      console.exception(err);
    }
  });
}

//wraps part, measure and note only child elements
//into one element arrays for later better manipulation
function onlyChildren2Array(scoreJson) {
  if(! $.isArray(scoreJson["score-partwise"].part) ) {  //or !(x instanceof Array)
    scoreJson["score-partwise"].part = [ scoreJson["score-partwise"].part ];
  }
  if(! $.isArray(scoreJson["score-partwise"].part[0].measure) ) {
    scoreJson["score-partwise"].part[0].measure = [ scoreJson["score-partwise"].part[0].measure ];
  }
  for (var i in scoreJson["score-partwise"].part[0].measure) {
    if(! $.isArray(scoreJson["score-partwise"].part[0].measure[i].note) ) {
      scoreJson["score-partwise"].part[0].measure[i].note = [ scoreJson["score-partwise"].part[0].measure[i].note ];
    }
  }
  return scoreJson;
}