var Source = (function () {
    var src;
    try {
        src = new WebSocket('ws://localhost:5002/');
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
        invalid: [],
        contents: '',
        selections: []
    };

    var lastSelectionPos = {
        begin: {},
        end: {}
    };

    var sources = {};

    return {
        addNewSource: function (name, language, contents) {
            Source.saveCurrentSource();
            var lookup = sources[name];
            if (lookup === undefined || lookup === null) {
                sources[name] = {
                    source: name,
                    id: 0,
                    language: language,
                    invalid: [],
                    contents: contents,
                    selections: []
                }
            } else {
                console.log('source already existing: ' + name);
            }
        },
        removeSource: function(name) {
            sources[name] = null;
            delete sources[name];
        },
        loadSource: function (name) {
            Source.saveCurrentSource();
            source = sources[name];
        },
        saveCurrentSource: function () {
            sources[source.source] = source;
        },
        getMessageBySource: function (name) {
            return sources[name];
        },
        getMessage: function () {
            return source;
        },
        setMessage: function (value) {
            source = value;
        },
        setMessageSource: function (value) {
            source.source = value;
        },
        setMessageLanguage: function (value) {
            source.language = value;
        },
        setMessageContents: function (value) {
            source.contents = value;
        },
        setMessageSelection: function (value) {
            source.selections = value;
        },
        setMessageId: function (value) {
            source.id = value;
        },
        send: function () {
            src.send(JSON.stringify(source));
            $('#tab-version').html(Monto.toHtmlString(source));
            source.id += 1;
            source.selections = [];
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
            Source.setMessageSelection([{begin: begin, end: end}]);
            console.log(Source.getMessage());
            console.log(begin);
            console.log(end);
            Source.send();
        },
        getLastSelectionPos: function () {
            return lastSelectionPos;
        }
    };
})();