CindyJS.registerPlugin(1, "improvrnn", function(api) {
    let rnn = new mm.MusicRNN(
        'https://storage.googleapis.com/download.magenta.tensorflow.org/tfjs_checkpoints/music_rnn/chord_pitches_improv'
    );


    const { midi, Note } = Tonal;
    const sequence = {
        ticksPerQuarter: 220,
        totalTime: 58,
        timeSignatures: [
        {
          time: 0,
          numerator: 4,
          denominator: 4
        }
        ],
        tempos: [
        {
          time: 0,
          qpm: 120
        }
        ],
        notes: [
        { pitch: midi('Gb4'), startTime: 0, endTime: 1 },
        { pitch: midi('F4'), startTime: 1, endTime: 3.5 },
        { pitch: midi('Ab4'), startTime: 3.5, endTime: 4 },
        { pitch: midi('C5'), startTime: 4, endTime: 4.5 },
        { pitch: midi('Eb5'), startTime: 4.5, endTime: 5 },
        { pitch: midi('Gb5'), startTime: 5, endTime: 6 },
        { pitch: midi('F5'), startTime: 6, endTime: 7 }
        ]
    };
    const quantizedSequence = mm.sequences.quantizeNoteSequence(sequence, 1);

    var real = function(r) {
        return {
          "ctype": "number",
          "value": {
            'real': r,
            'imag': 0
          }
        };
      };

      var list = function(l) {
        return {
          'ctype': 'list',
          'value': l
        };
      };

      var wrap = function(v) {
    if (typeof v === "number") {
      return real(v);
    }
    if (typeof v === "object" && v.length !== undefined) {
      var li = [];
      for (var i = 0; i < v.length; i++) {
        li[i] = wrap(v[i]);
      }
      return list(li);
    }
    if (typeof v === "string") {
      return {
        ctype: "string",
        value: v
      };
    }
    if (typeof v === "boolean") {
      return {
        ctype: "boolean",
        value: v
      };
    }
    return nada;
  };
  var recreplace = function(ex, rmap) {
    if (ex.ctype === "variable" && rmap[ex.name]) {
      return rmap[ex.name];
    } else {
      if (ex.args)
        ex.args = ex.args.map(e => recreplace(e, rmap));
      return ex;
    }
  };

    var init = false;
    var processrunning = false;

    async function getMelody(cdycallback) {
        if (processrunning) return;
        processrunning = true;

        if (!init) await rnn.initialize();
        init = true;
        console.log("calling")

        const improvisedMelody = await rnn.continueSequence(quantizedSequence, 60, 1.1,
            ['Bm', 'Bbm', 'Gb7', 'F7', 'Ab', 'Ab7', 'G7', 'Gb7', 'F7', 'Bb7', 'Eb7', 'AM7']);

        melody = wrap(improvisedMelody.notes.map(k => k.pitch));

        api.evaluate(recreplace(cdycallback, {'m': melody}));

        processrunning = false;
    };

    api.defineFunction("continueSequence", 1, function(args, modifs) {
        if (processrunning) {
            console.log("skip continueSequence, because process is already running");
            return api.nada;
        }
        getMelody(args[0]);
        return api.nada;
    });
});
