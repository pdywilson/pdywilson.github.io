CindyJS.registerPlugin(1, "rnn10", function(api) {
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




    //Helpers for getFeatureVector
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



    function getFeatureVectors(notes, chords, chordsroot, key) {
        encodingDict = {
            'melody': true,
            'melodyModulo': true,
            'melodyEncoded': false,
            'duration': false,
            'durationEncoded': false,
            'chordsRoot': true,
            'chordsNormally': true,
            'chordsEncoded': false,
            'key': false
        }
        features = [];
        for (const [i, note] of notes.entries()) {
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
            //if (encodingDict['duration']) feature = feature.concat(oneHot(parseInt(times[i], 10), 48));
            if (encodingDict['chordsRoot']) 
                feature = feature.concat(chordsroot[i]);
                if (i < notes.length - 1){
                    feature = feature.concat(chordsroot[i + 1]);
                } else {
                    feature = feature.concat(chordsroot[i]);
                }
            if (encodingDict['chordsNormally']) {
                feature = feature.concat(chords[i]);
                if (i < notes.length - 1){
                    feature = feature.concat(chords[i + 1]);
                } else {
                    feature = feature.concat(chords[i]); // experiment: changed this from zeros
                }
            }
            if (encodingDict['key']) feature = feature.concat(oneHot(parseInt(key, 10), 24));
            features.push(feature);
        }
        const featuresTensor = new tf.tensor2d(features);
        return featuresTensor;
    }


    async function getPrediction(input) {
        if (!modelLoaded) {
            modelfile = 'tfjs/best_model2/model.json';
            model = await tf.loadLayersModel(modelfile);
            modelLoaded = true;
            console.log("loaded "+modelfile);
        }

        // const pitch = tf.tidy(() => {
        //     const output = model.predict(input);
        //     const pitch = output.argMax(axis = 1);
        //     return pitch.dataSync();
        // });

        const output = model.predict(input);
        const pitch = await output.argMax(axis = 1).data();
        
        const sampled_pitch = pitch[0];

        return sampled_pitch;
    }


    //HELPERS for getMelody
    function time_to_tick(time) {
        return parseInt(time * TIMES, 10);
    }

    function tick_to_time(tick) {
        return tick / TIMES;
    }

    const major = [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0];
    const minor = [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0];
    function rotate(arr, n){
        return arr.slice(n).concat(arr.slice(0,n));
    }
    function getChord(ch){
        if (ch < 12){
            return rotate(minor,12-ch);
        }
        else {
            ch = ch-12;
            return rotate(major,12-ch);
        }
    }
    function getRoot(ch){
        return oneHot(ch % 12,12);
    }

    let processrunning = false;
    async function getMelody(inputmelody, chords, cdycallback) {
        if (processrunning) return;
        processrunning = true;

        let key = 0;
        let max_seq_len = 16; //otherwise too slow
        
        let notesnew = inputmelody.map(elt => elt[0] - LOW);
        let chordsnew = inputmelody.map(elt => getChord(chords[elt[1]-1]));
        let chordsroot = inputmelody.map(elt => getRoot(chords[elt[1]-1]));

        notesnew = notesnew.slice(-max_seq_len);
        chordsnew = chordsnew.slice(-max_seq_len);
        chordsroot = chordsroot.slice(-max_seq_len);

        console.log('notesnew',notesnew);
        console.log('chordsnew',chordsnew);
        console.log('chordsroot',chordsroot);

        console.time("predtime");
        let feat = getFeatureVectors(notesnew, chordsnew, chordsroot, key);
        let input = tf.expandDims(feat, 0);
        let note = await getPrediction(input);
        console.timeEnd("predtime");

        console.log("prednote "+note);  
        
        if (note == MELODY - 1) {
            note = "p";
        } else {
            note = note + LOW; // 0 -> 48 C
        };

        let improvisedMelody = [note];

        cdymelody = wrap(improvisedMelody);

        api.evaluate(recreplace(cdycallback, {
            'm': cdymelody
        }));
        
        processrunning = false;
    };

    api.defineFunction("continueSequence", 3, function(args, modifs) {
        if (processrunning) {
            console.log("skip continueSequence, because process is already running");
            return api.nada;
        }

        let inputmelody = unwrap(api.evaluate(args[0]));
        let chords = unwrap(api.evaluate(args[1]));

        console.log('inputmelody',inputmelody);
        getMelody(inputmelody, chords, cloneExpression(args[2]));
        
        return api.nada;
    });


    api.defineFunction("getLanguage", 1,function(args,modifs) {
        let lang = window.navigator.userLanguage || window.navigator.language;
        console.log('language', lang); //works IE/SAFARI/CHROME/FF

        cdylang = wrap(lang);
        cdycallback = cloneExpression(args[0]);

        api.evaluate(recreplace(cdycallback, {
            'm': cdylang
        }));
    });
});
