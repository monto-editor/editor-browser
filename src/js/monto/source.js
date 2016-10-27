var Source = (function () {
    var src;
    try {
        src = new WebSocket('ws://localhost:5003/');
    } catch (e) {
        $('#con-btn').removeClass('btn-success').addClass('btn-danger');
        $('#con-glyph').removeClass('fa-check').addClass('fa fa-remove');
    }
    src.onerror = function() {
        $('#con-btn').removeClass('btn-success').addClass('btn-danger');
        $('#con-glyph').removeClass('fa-check').addClass('fa fa-remove');
    };
    src.onclose = function() {
        $('#con-btn').removeClass('btn-success').addClass('btn-danger');
        $('#con-glyph').removeClass('fa-check').addClass('fa fa-remove');
    };

    var source = {
        source: 'nofile',
        id: 0,
        language: 'text',
        contents: ''
    };

    var lastSelectionPos = {
        begin: {},
        end: {}
    };

    var sources = {};

    return {
        addNewSource: function (name, language, contents) {
            var lookup = sources[name];
            if (lookup === undefined || lookup === null) {
                sources[name] = {
                    source: {
                        physical_name: name,
                        logical_name: null
                    },
                    id: 0,
                    language: language,
                    contents: contents
                }
            }
        },
        removeSource: function(name) {
            delete sources[name];
        },
        loadSource: function (name) {
            source = sources[name];
        },
        getMessageBySource: function (name) {
            return sources[name];
        },
        getMessage: function () {
            return source;
        },
        /*
         Sadly {physical_name: "Test", logical_name: null} === {physical_name: "Test", logical_name: null}
         evaluates to false. So objects can't be compared with === or ==. To compare two sources,
         you must use Source.equals(src1, src2).

            var dict = {}
            dict[{physical_name: "Test", logical_name: null}] = 1
            dict[{physical_name: "Test", logical_name: null}] = 2
         Strangely dict now has only one key/value pair and dict[{physical_name: "Test", logical_name: null}] has value 2.
         So usage of objects in dictonaries works without special comparisons, but for now includes the also logical_name.
        */
        equals: function (firstSrc, secondSrc) {
            // to compare all attributes:
            // return JSON.stringify(src1) === JSON.stringify(src2)
            // but for now identity on Sources only includes the physical_name
            return firstSrc.physical_name === secondSrc.physical_name;
        },
        setMessageLanguage: function (value) {
            source.language = value;
        },
        setMessageContents: function (value) {
            source.contents = value;
        },
        resetMessageSelection: function () {
            delete source["selection"];
        },
        send: function () {
            $('#tab-version').html(Monto.toHtmlString(source));
            src.send(JSON.stringify({tag:"source",contents:source}));
            source.id += 1;
        },
        resend: function () {
            $('#tab-version').html(Monto.toHtmlString(source));
            src.send(JSON.stringify({tag:"source",contents:source}));
            source.id += 1;
        },
        sendWithSelection: function (selection) {
            source.selection = selection;
            src.send(JSON.stringify({tag:"source",contents:source}));
            source.id += 1;
        },
        sendConfigurations: function(configs) {
            src.send(JSON.stringify({tag:"configurations",contents:configs}))
        },
        sendDiscoverMessage: function(discover) {
            src.send(JSON.stringify({tag:"discovery",contents:discover}))
        },
        sendSource: function(source) {
            var sourceMessage = sources[source];
            if (sourceMessage !== undefined && sourceMessage !== null) {
                $('#tab-version').html(Monto.toHtmlString(sourceMessage));
                src.send(JSON.stringify({tag:"source",contents:sourceMessage}));
                sourceMessage.id += 1;
                sources[source] = sourceMessage;
            } else {
                alert("Broker requested source for " + source + ". It was not found. Not answering.");
            }
        },
        setPosAndSend: function () {
            var editor = $('.CodeMirror')[0].CodeMirror;
            var cursor = editor.getCursor();
            lastSelectionPos.end = cursor;
            var end = Monto.convertCMToMontoPos(cursor);
            var line = editor.getLine(cursor.line);
            if (cursor.ch === 0) {
                return;
            }
            var begin;
            for (var i = cursor.ch; i > -1; i--) {
                if (line[i] === ' ') {
                    begin = {ch: i+1, line: cursor.line};
                    lastSelectionPos.begin = begin;
                    begin = Monto.convertCMToMontoPos(begin);
                    break;
                }
            }
            Source.sendWithSelection({offset: begin, length: end-end});
        },
        getLastSelectionPos: function () {
            return lastSelectionPos;
        }
    };
})();
