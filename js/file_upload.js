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

      reader.onload = function(e) {   //after FileReader finishes reading
        xmlDoc = $.parseXML(reader.result);   //parse xml using jQuery
        $xml = $(xmlDoc);   //make jQuery object from it
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