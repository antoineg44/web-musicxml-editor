# Vexflow Notation Editor
This is an open source online notation editor/music composition tool powered by javascript and the VexFlow API.  You can view a demo of the current progress <a href="http://webmonkeydd.com/vexflow-notation-editor.html">here</a>.

To use, simply download all the contents and open vexflow-notation-editor.html in your browser.

# Notation Editor Dependencies

Vexflow, jQuery and Bootstrap

# Code

The only time the VexFlow API is touched is in the <code>editor.draw.staves()</code> method.  When actually creating the staves, notes, time signatures etc. they are stored in the array of staves objects.  Each object in the staves array represents a single measure which has many properties such as it's time signature and key.

Each measure contains four voices (for now anyway).  They are v1, v2, v3 and v4.  These four voices contain the notes in that voice.  You can see the first voice (v1) has a single note in it.

All of these properties will be then passed to the VexFlow API and drawn when <code>editor.draw.staves()</code> is called.

<pre>
<code>
editor.staves = [
	{
		clef: 'treble',
		timeSigTop: 4,
		timeSigBottom: 4,
		keySig: 'C',
		v1: [{
			keys: 'C/4',
			duration 'q',
			x: 200,
			y: 200,
			accidental: '#',
			dotted: false,
		}],
		v2: [],
		v3: [],
		v4: [],
		x: 400,
		y: 400,
		width: 200,
	},
];
</code>
</pre>

# Pushing a Stave

<pre>
<code>
editor.staves.push(
  {
    // define the properties here.  Properties are usually defined later via dropdowns, buttons etc.
  }
);
</code>
</pre>

# Pushing a Note to Voice One

<pre>
<code>
editor.staves[i].v1.push(
  {
    // define whichever properties you'd like here.
		keys: 'C/4',
		duration 'q',
		x: 200,
		y: 200,
		accidental: '#',
		dotted: false,
  }
);
</code>
</pre>

# Selection Data

All of the data regarding the current selected measures and notes is stored in <code>editor.selected.measure</code> and <code>editor.selected.note</code>

<pre>
<code>
editor.selected = {
	insertNote: null,
	measure: {
		selection: null,
		previousSelection: null,
		doubleClick: false,
		x: 0,
		y: 0,
		width: 0,
		height: 0,
	},
	note: {
		selection: null,
		previousSelection: null,
		clicked: false,
		doubleClick: false,
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		voice: 1,
	}
}
</code>
</pre>

# Other Methods and General Structure

Selection methods are here in <code>editor.select</code>.

Deletion methods are here in <code>editor.delete</code>.

Selection methods are here <code>editor.select</code>.

# Rendering Engine

Currently the editor renders at 30fps.  All of the actual rendering/drawing takes place in the <code>editor.draw.staves()</code> method.

<code>editor.draw.staves()</code> is run 30 times per second.

# Coding Standards

When using the Vexflow API, try to use the API.  Don't go digging around in their objects unless it's absolutely necessary.  Stick to the notation editor objects and pass those to the API and have it do it's thing.

# To Do

<ol>
  <li>Grand Staff</li>
  <li>Auto Generated Guitar Tabs</li>
  <li>Midi Playback</li>
  <li>Proper Auto Beaming (Some issues right now)</li>
  <li>Quarter and Eigth Note Triplets</li>
  <li>Don't Allow More Beats than the Meausre Should Have</li>
  <li>Manually Change Stem Directions</li>
  <li>Import/Export</li>
</ol>

# Known Bugs

<ol>
  <li>Double Time Signatures on Start of New Lines</li>
  <li>Measures Disappear When Mouse Moves too High or Low</li>
  <li>Flags Remain on Notes that Have Been Beamed</li>
</ol>

