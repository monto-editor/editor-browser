var Source = (function () {
    var src;
    try {
        src = new WebSocket('ws://localhost:5002/');
    } catch (e) {
        $('#con-btn').removeClass('btn-success').addClass('btn-danger');
        $('#con-glyph').removeClass('fa-check').addClass('fa-remove');
    }
    src.onerror = function() {
        $('#con-btn').removeClass('btn-success').addClass('btn-danger');
        $('#con-glyph').removeClass('fa-check').addClass('fa-remove');
    };
    src.onclose = function() {
        $('#con-btn').removeClass('btn-success').addClass('btn-danger');
        $('#con-glyph').removeClass('fa-check').addClass('fa-remove');
    };

    var version = {
        source: 'nofile',
        id: 0,
        language: localStorage.getItem('editor-language'),
        invalid: [],
        contents: '',
        selections: []
    };

    return {
        getMessage: function () {
            return version;
        },
        setMessage: function (value) {
            version = value;
        },
        setMessageSource: function (value) {
            version.source = value;
        },
        setMessageLanguage: function (value) {
            version.language = value;
        },
        setMessageContents: function (value) {
            version.contents = value;
        },
        setMessageSelection: function (value) {
            version.selections = value;
        },
        setMessageId: function (value) {
            version.id = value;
        },
        send: function () {
            src.send(JSON.stringify(version));
            $('#tab-version').html(Monto.toHtmlString(version));
            version.id += 1;
            version.selections = [];
        },
        setPosAndSend: function () {
            var editor = $('.CodeMirror')[0].CodeMirror;
            var pos = Monto.convertCMToMontoPos(editor.getCursor());
            Source.setMessageSelection([{begin: pos, end: pos}]);
            Source.send();
        }
    };
})();