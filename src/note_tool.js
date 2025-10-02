/*
Project: Concerto
  https://github.com/panarch/concerto
Code authors:
  Taehoon Moon <panarch@kaist.ac.kr>, 2014
Licensed under MIT license
  https://github.com/panarch/concerto/blob/master/LICENSE
Modifications:
  function transposeNote created by Thomas Hudziec, 2016
*/

editor.NoteTool = {
    // Calcul de la durée des notes d'une mesure
    mesure_duration: function(vfStaveNotes) {
        var mesure_duration = 0;
        for (var index = 0; index < vfStaveNotes.length; index++) {
            mesure_duration += 1/parseInt(editor.table.DURATION_DICT[vfStaveNotes[index].getDuration()]);
        }
        return mesure_duration;
    },
    // Calcul s'il reste de la place dans la mesure
    mesure_complete: function(vfStaveNotes) {
        return editor.NoteTool.mesure_duration(vfStaveNotes) >= 1;
    },
    // Calcul s'il reste de la place dans la mesure
    mesure_add_duration: function(vfStaveNotes, new_note) {
        return mesure_duration(vfStaveNotes) + 1/parseInt(editor.table.DURATION_DICT[new_note.getDuration()]) < 1;
    },
    complete_mesure_silence: function(gl_VfStaveNotes, measureIndex, noteIndex) {
        duration = editor.NoteTool.mesure_duration(gl_VfStaveNotes[measureIndex]);
        div = 2;
        while(duration < 1) {
            if(duration + 1/div <= 1) {
                console.log(div);
                console.log(editor.table.DURATION_DICT_INV[div.toString()]+'r');
                var newNote = new Vex.Flow.StaveNote({
                    keys: [ editor.selected.cursorNoteKey ],
                    duration: editor.table.DURATION_DICT_INV[div.toString()]+'r',
                    auto_stem: true
                });
                newNote.setId('m' + measureIndex + 'n' + noteIndex+1);
                gl_VfStaveNotes[measureIndex].splice(noteIndex+1, 0, newNote);
                duration += 1/div;
            }
            div *= 2;
        }
    },
    mesure_get_next_duration: function(vfStaveNotes) {
        duration = editor.NoteTool.mesure_duration(vfStaveNotes);
        div = 2;
        while(duration < 1) {
            if(duration + 1/div <= 1) {
                duration += 1/div;
            }
            div *= 2;
        }
        return div/2;
    }
};

    /**
     * @param {Object} staveNote
     * @param {number} divisions
     * @return {number}
     */
    editor.NoteTool.getDurationFromStaveNote = function getDurationFromStaveNote(staveNote, divisions) {
        var noteType = staveNote.getDuration();
        var numDots;

        if(staveNote.isDotted())
            numDots = staveNote.dots;
        else
            numDots = 0;

        var index = editor.table.NOTE_VEX_TYPES.indexOf(noteType);
        var offset = index - editor.table.NOTE_VEX_QUARTER_INDEX;
        var duration = Math.pow(2, offset) * divisions;
        duration = duration * 2 - duration * Math.pow(2, -numDots);

        return duration;
    };

    function _calculateNoteType(duration, divisions) {
        var i = 0;
        var count;
        var num;
        for (count = 0; count < 20; count++) {
            num = Math.floor(duration / divisions);
            if (num === 1)
                break;
            else if (num > 1) {
                divisions *= 2;
                i++;
            }
            else {
                divisions /= 2;
                i--;
            }
        }

        if (count === 20)
            // TODO throw exception
            console.error('No proper StaveNote type');

        var dots = 0;
        for (count = 0; count < 5; count++) {
            duration -= Math.floor(duration / divisions);
            divisions /= 2;
            num = Math.floor(duration / divisions);
            if (num === 1)
                dots++;
            else
                break;
        }

        return {
            index: i,
            dots: dots
        };
    }

    /**
     * @param {number} duration
     * @param {number} divisions
     * @param {boolean=} withDots
     */
    editor.NoteTool.getStaveNoteTypeFromDuration = function getStaveNoteTypeFromDuration(duration, divisions, withDots) {
        if (withDots === undefined)
            withDots = false;

        var result = _calculateNoteType(duration, divisions);
        var index = editor.table.NOTE_VEX_QUARTER_INDEX + result.index;
        var noteType = editor.table.NOTE_VEX_TYPES[index];

        if (withDots) {
            for (var i = 0; i < result.dots; i++)
                noteType += 'd';
        }

        return noteType;
    };

    editor.NoteTool.getNoteTypeFromDuration = function getNoteTypeFromDuration(duration, divisions) {
        var result = _calculateNoteType(duration, divisions);
        var index = editor.table.NOTE_QUARTER_INDEX + result.index;

        return {
            type: editor.table.NOTE_TYPES[index],
            dot: result.dots
        };
    };

    // transposes note by whole tones
    // example:
    // key: 'c/4'
    // interval: 2
    // return: 'e/4'
    // TODO perform automated testing to proof complete correctness
    // author Thomas Hudziec, 2016
    editor.NoteTool.transposeNote = function transposeNote(key, interval) {
        var step = key[0];
        var octave = +key[key.length - 1];
        var maxInterval = 24;

        if(interval > maxInterval) interval = maxInterval;
        else if(interval < -maxInterval) interval = -maxInterval;

        var mod = editor.table.TONES.length;

        var currentIndex = editor.table.TONES.indexOf(step);
        var shifted = currentIndex + interval;
        var newIndex = shifted % mod;
        if(newIndex < 0) newIndex += mod;
        var newKey = editor.table.TONES[newIndex];

        var octaveShift = shifted / mod;
        octaveShift = Math.floor(octaveShift);
        var newOctave = octave + octaveShift;

        return newKey+'/'+newOctave;
    };