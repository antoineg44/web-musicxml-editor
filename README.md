# Web Editor of MusicXML Files
Browser based music score editor with basic MusicXML import/export. Uses Vexflow for music engraving into HTML5 svg element. Provides mouse interactivity for manipulation with musical score.

You can see live demo [here](http://freetomik.github.io/).

## Dependencies
Vexflow, jQuery and Bootstrap

## Current limitations
<ul>
  <li>Missing check if notes fit the bar. Only one note can be added into measure.</li>
  <li>Minimal subset of MusicXML format supported.</li>
  <li>Editor works with only first part of music score.</li>
</ul>

## To Do
<ol>
  <li>Duration check for notes in measure</li>
  <li>Chords support</li>
  <li>Playback</li>
  <li>Keyboard interactivity</li>
  <li>Multiple score parts</li>
</ol>

## Contribution
You are welcome to contribute!

Fork, clone, make your feature branch, implement feature, make pull request :-)

Running project locally:
Run following command in project directory:
```
$ python -m SimpleHTTPServer
```
Open localhost:8000 in your browser.
