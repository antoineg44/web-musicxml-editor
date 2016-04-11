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