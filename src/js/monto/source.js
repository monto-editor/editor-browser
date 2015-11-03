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
        version_id: 0,
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
        setMessageVersionId: function (value) {
            version.version_id = value;
        },
        send: function () {
            src.send(JSON.stringify(version));
            $('#tab-version').html(Monto.toHtmlString(version));
            version.version_id += 1;
            version.selections = [];
        },
        setPosAndSend: function () {
            var editor = $('.CodeMirror')[0].CodeMirror;
            var pos = Monto.convertCMToMontoPos(editor.getCursor());
            Source.setMessageSelection([{end: pos, begin: pos}]);
            Source.send();
        }
    };
})();