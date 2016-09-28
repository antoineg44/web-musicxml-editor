# Web Editor of MusicXML Files
Browser based music score editor with basic MusicXML import/export. Uses Vexflow for music engraving into HTML5 svg element. Provides mouse interactivity for manipulation with musical score.

You can see live demo [here](http://freetomik.github.io/).

## Dependencies
Vexflow, jQuery and Bootstrap

## Current limitations
<ul>
  <li>Missing check if notes fit the bar. Only one note can be added into measure.</li>
  <li>Minimal subset of MusicXML format supported.</li>
  <li>Editor works with only first musical part of music score.</li>
</ul>

## To Do
<ol>
  <li>Duration check for notes in measure - in progress</li>
  <li>Playback - basics done, improvements needed</li>
  <li>Bug fixes - in progress</li>
  <li>Chords support - waiting</li>
  <li>Keyboard interactivity - waiting</li>
  <li>Multiple score parts - waiting</li>
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

This project was initially created as a bachelor [thesis](https://diplomky.redhat.com/thesis/show/356/web-editor-of-musicxml-files).
