CindyJS.registerPlugin(1, "rnn3", function(api) {
    //inspired by https://github.com/montaga/montaga.github.io/blob/master/posenet/posenet-plugin.js

    //CindyJS Helpers
    var cloneExpression = function(obj) {
        var copy;
        if (null == obj || "object" != typeof obj) return obj;
        if (obj instanceof Array) {
            copy = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                copy[i] = cloneExpression(obj[i]);
            }
            return copy;
        }

        if (obj instanceof Object) {
            copy = {};
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) {
                    if (['oper', 'impl', 'args', 'ctype', 'stack', 'name', 'arglist', 'value', 'real', 'imag', 'key', 'obj', 'body'].indexOf(attr) >= 0)
                        copy[attr] = cloneExpression(obj[attr]);
                }
            }
            if (obj['modifs']) copy['modifs'] = obj['modifs']; //modifs cannot be handeled in recursion properly
            return copy;
        }
    };

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

    var unwrap = function(v) {
        if (typeof v !== "object" || v === null) {
            return v;
        }
        if (Array.isArray(v)) {
            return v.map(unwrap);
        }
        switch (v.ctype) {
            case "string":
            case "boolean":
                return v.value;
            case "number":
                if (v.value.imag === 0)
                    return v.value.real;
                return {
                    r: v.value.real,
                        i: v.value.imag
                };
            case "list":
                return v.value.map(unwrap);
            default:
                return null;
        }
    };

    // end CindyJS Helpers



    // GLOBALS
    let modelLoaded = false;
    const LOW = 48; // C2=48, C3=60, C4=72, C5=84, C6=96
    const HIGH = 84; //range(48,84) = 36 notes
    const MELODY = 37;
    const TIMES = 48;
    const CHORDS = 12;



    function oneHot(idx, arraysize) {
        ar = new Array(arraysize).fill(0);
        if (idx >= arraysize) {
            console.error("error idx > arraysize", idx, arraysize);
            return ar;
        }
        ar[idx] = 1;
        return ar;
    }

    function getCircleOfThirds(note) {
        let circleMajor = x => x % 4;
        let circleMinor = x => x % 3;
        representation = new Array(11).fill(0);
        if (note < MELODY - 1) {
            absnote = note % 12;
            octave = parseInt(note / 12, 10);
            representation[7 + octave] = 1;
            representation[circleMajor(absnote)] = 1;
            representation[4 + circleMinor(absnote)] = 1;
        } else {
            representation[-1] = 1
        }
        return representation
    }



    function getFeatureVectors(notes, times, chords, key) {
        encodingDict = {
            'melody': true,
            'melodyModulo': true,
            'melodyEncoded': false,
            'duration': false,
            'durationEncoded': false,
            'chordsNormally': true,
            'chordsEncoded': false,
            'key': false
        }
        features = [];
        for (const [i, note] of notes.slice(0, -1).entries()) {
            let feature = [];
            if (encodingDict['melody']) {
                if (notes[i] < MELODY) { // pitch or pause bit
                    feature = feature.concat(oneHot(notes[i], MELODY));
                } else {
                    console.log("melody over 37 or pause");
                    feature = feature.concat(new Array(MELODY).fill(0));
                }
            }
            if (encodingDict['melodyModulo']) {
                if (notes[i] < MELODY - 1) { // # only pitch bit or zeros if pause
                    feature = feature.concat(oneHot(notes[i] % 12, 12));
                } else {
                    feature = feature.concat(new Array(12).fill(0));
                }
            }
            if (encodingDict['melodyEncoded']) feature = feature.concat(getCircleOfThirds(note));
            if (encodingDict['duration']) feature = feature.concat(oneHot(parseInt(times[i], 10), 48));
            if (encodingDict['chordsNormally']) {
                feature = feature.concat(chords[i]);
                feature = feature.concat(chords[i + 1]);
            }
            if (encodingDict['key']) feature = feature.concat(oneHot(parseInt(key, 10), 24));
            features.push(feature);
        }
        const featuresTensor = new tf.tensor2d(features);
        return featuresTensor;
    }


    async function getPrediction(input) {
        if (!modelLoaded) {
            model = await tf.loadLayersModel('tfjs/model3/model.json');
            modelLoaded = true;
        }
        
        let d = new Date();
        let t = d.getTime();
        const output = model.predict(input);
        d = new Date();
        console.log("time",d.getTime()-t);
        const pitch = await output.argMax(axis = 1).data();
        //try sampling
        // const pitch = await output[0].data();
        // const duration = await output[1].data();
        //
        // let pitems = [];
        // for (const [i, elt] of pitch.entries()){pitems.push([i, elt]);}
        // pitems.sort(function(first, second) {return second[1] - first[1];});
        //
        // pitems = pitems.slice(0,5);
        // let psum = 0;
        // for (const elt of pitems) { psum += elt[1]; }
        // for (const [i,elt] of pitems.entries()) { pitems[i][1] = elt[1]/psum;}
        //
        //
        // let ditems = [];
        // for (const [i, elt] of duration.entries()){ditems.push([i, elt]);}
        // ditems.sort(function(first, second) {return second[1] - first[1];});
        //
        // ditems = ditems.slice(0,5);
        // let dsum = 0;
        // for (const elt of ditems) { dsum += elt[1]; }
        // for (const [i,elt] of ditems.entries()) { ditems[i][1] = elt[1]/dsum;}
        //
        // let r1 = Math.random();
        // let r2 = Math.random();
        // let s1 = 0;
        // let i1 = 0;
        // while(s1 < r1){
        //     s1 += ditems[i1][1];
        //     i1 += 1;
        // }
        // let s2 = 0;
        // let i2 = 0;
        // while(s2 < r2){
        //     s2 += pitems[i2][1];
        //     i2 += 1;
        // }
        // const duration_i = i1-1;
        // const pitch_i= i2-1;
        // const sampled_pitch = pitems[pitch_i][0];
        // const sampled_duration = ditems[duration_i][0];

        const sampled_pitch = pitch[0];
        const sampled_duration = 23;

        return [sampled_pitch, sampled_duration];
    }

    //let input = getFeatureVectors(notes, times, chords);
    //input = tf.expandDims(input,0);
    //const output = getPrediction(input);

    function time_to_tick(time) {
        return parseInt(time * TIMES, 10);
    }

    function tick_to_time(tick) {
        return tick / TIMES;
    }

    function getNotesAndDurations(inputmelody) {
        let notes = [];
        let times = [];
        let oldtime = 0;
        let skip = false;
        for (let elt of inputmelody) {
            if (elt[1] < oldtime) { //current begins before last ends
                if (elt[2] < oldtime) { //current begins and ends before last ends
                    skip = true;
                } else { //end of last until end of current
                    time = time_to_tick(elt[2] - oldtime) - 1;
                    oldtime = elt[2];
                }
            } else { //begin of current until end of current
                time = time_to_tick(elt[2] - elt[1]) - 1;
                oldtime = elt[2];
            }
            if (!skip) {
                notes.push(elt[0] - LOW);
                times.push(Math.min(time, TIMES - 1));
                time = time - (TIMES - 1);
                if (time > 0) {
                    while (time > TIMES - 1) {
                        notes.push(elt[0] - LOW);
                        times.push(TIMES - 1);
                        time = time - (TIMES - 1);
                    }
                    if (time > 0) {
                        notes.push(elt[0] - LOW);
                        times.push(time);
                    }
                }
            }
        }
        //console.log(notes,times);
        return [notes, times];
    }

    function getCindyMelody(notes, times) {
        melody = [];
        currenttick = 0;
        for (let [i, note] of notes.entries()) {
            if (note == MELODY - 1) {
                note = "p";
            } else {
                note = note + LOW;
            };
            melody.push([note, tick_to_time(times[i])]);
        }
        return melody;
    }

    function getCindyMelodyFixedDurations(notes, durations) {
        melody = [];
        melody.push(["p", durations[0]]);
        currenttick = 0;
        for (let [i, note] of notes.entries()) {
            if (note == MELODY - 1) {
                note = "p";
            } else {
                note = note + LOW;
            };
            melody.push([note, durations[i+1]]);
        }
        return melody;
    }



    let processrunning = false;
    async function getMelody(inputmelody, durations, chords, bars, cdycallback) {
        let d = new Date();
        let t = d.getTime();
        if (processrunning) return;
        processrunning = true;

        const major = [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0];
        const minor = [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0];
        function rotate(arr, n){
            return arr.slice(n).concat(arr.slice(0,n));
        }
        function getChord(ch){
            ch = ch - 1;
            if (ch < 12){
                return rotate(minor,12-ch);
            }
            else {
                ch = ch-12;
                return rotate(major,12-ch);
            }
        }
        function getChordArray(chords,bars){
            let A = getChord(chords[0]);
            let B = getChord(chords[1]);
            let C = getChord(chords[2]);
            let D = getChord(chords[3]);
            let chordsnew = new Array(4).fill(A);
            if(bars>1) chordsnew = chordsnew.concat(new Array(4).fill(B));
            if(bars>2) chordsnew = chordsnew.concat(new Array(4).fill(C));
            if(bars>3) chordsnew = chordsnew.concat(new Array(4).fill(D));
            chordsnew = chordsnew.concat(chordsnew.slice(-1));
            return chordsnew;
        }

        
        let chordsnew = getChordArray(chords,bars);

        // let chordC = [0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0];
        // let chordF = [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0];
        // let chordsC = new Array(4).fill(chordC);
        // let chordsF = new Array(5).fill(chordF);
        // let chordss = chordsC.concat(chordsF);

        const notesAndDurations = getNotesAndDurations(inputmelody);
        let key = 0;

        let predicted_durations = [];
        let predicted_notes = [];
        const mel_len = 8 + 1;

        notesnew = notesAndDurations[0].slice(-mel_len);
        timesnew = notesAndDurations[1].slice(-mel_len);
        //chordsnew = chordss;


        //padding Test
        while (notesnew.length < mel_len) {
            notesnew.unshift(12);
            timesnew.unshift(parseInt((TIMES / 8 - 1), 10));
        }

        //predict iteratively
        let currtime = 0;
        let i = 0;
        while (i < durations.length - 1) {
            i+=1;
            let feat = getFeatureVectors(notesnew, timesnew, chordsnew, key);
            let input = tf.expandDims(feat, 0);
            let pred = await getPrediction(input);
            predicted_notes.push(pred[0]);
            predicted_durations.push(pred[1]);
            notesnew = notesnew.slice(1).concat(pred[0]);
            timesnew = timesnew.slice(1).concat(pred[1]);
            let currbeat = parseInt((currtime + pred[1]) / 12, 10) - parseInt(currtime / 12, 10);
            chordsnew = chordsnew.slice(currbeat).concat(chordsnew.slice(0, currbeat));
            currtime += pred[1];
        }

        const improvisedMelody = getCindyMelodyFixedDurations(predicted_notes, durations);
        console.log("predicted melody", improvisedMelody);
        cdymelody = wrap(improvisedMelody);

        api.evaluate(recreplace(cdycallback, {
            'm': cdymelody
        }));
        d = new Date();
        console.log("Time: getMelody",d.getTime()-t);
        processrunning = false;
    };

    api.defineFunction("continueSequence", 5, function(args, modifs) {
        if (processrunning) {
            console.log("skip continueSequence, because process is already running");
            return api.nada;
        }

        let inputmelody = unwrap(api.evaluate(args[0]));
        let durations = unwrap(api.evaluate(args[1]));
        let chords = unwrap(api.evaluate(args[2]));
        let bars = unwrap(api.evaluate(args[3]));
        //console.log('durations',durations);
        console.log('inputmelody',inputmelody);
        
        getMelody(inputmelody, durations, chords, bars, cloneExpression(args[4]));
        
        return api.nada;
    });
});
