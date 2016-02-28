window.onload = function () {
    var editor = CodeMirror.fromTextArea(document.getElementById('editor'), {
        extraKeys: {
            'Ctrl-Space': function () {
                Source.setPosAndSend()
            },
            'F11': function (cm) {
                cm.setOption('fullScreen', !cm.getOption('fullScreen'));
            },
            'Esc': function (cm) {
                if (cm.getOption('fullScreen')) cm.setOption('fullScreen', false);
            },
            'Ctrl-L': function (cm) {
                $('#fileInput').trigger('click');
            }
        },
        lineNumbers: true,
        viewportMargin: Infinity,
        mode: 'monto',
        theme: 'monto',
        gutters: ["CodeMirror-lint-markers"],
        lint: true
    });

    function save() {
        saveAs(new Blob([editor.getValue()], {type: "text/plain;charset=utf-8"}), Source.getMessage().source);
    }

    function saveWith(content, name) {
        saveAs(new Blob([content], {type: "text/plain;charset=utf-8"}), name);
    }

    CodeMirror.commands.save = save;
    $('#save').on('click', save);

    $('#fullscreen').on('click', function () {
        editor.setOption('fullScreen', !editor.getOption('fullScreen'))
    });

    $('#load').on('click', function () {
        $('#fileInput').trigger('click')
    });

    $('#discover').on('click', function () {
        Discovery.discoverServices();
    });

    $('#configure').on('click', function () {
        Configuration.configureServices();
    });

    $('#fileInput').on('change', function (e) {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            var file = e.target.files[0];
            if (file.type.match('image.*')) {
                return;
            }
            var reader = new FileReader();
            reader.onload = function () {
                var text = reader.result;
                Source.setMessageContents(editor.getValue());
                var nameParts = file.name.split('.');
                var ending = nameParts.length > 1 ? nameParts[nameParts.length-1] : 'txt';
                var language = Monto.getLanguageByEnding(ending);
                Source.addNewSource(file.name, language, text);
                Source.loadSource(file.name);
                changeEditorLanguage(language);
                editor.setValue(text);
                $('#file-tabs').append('<li role="presentation" id="li-' + file.name + '"><a class="file-tab" href="#' + file.name + '">' + file.name + ' <button class="btn btn-xs btn-danger close-file" data-id="' + file.name + '"><span id="con-glyph" class="fa fa-remove"></span></button></a></li>'); //
                $('#file-div').append('<div role="tabpanel" id="' + file.name+ '" class="tab-pane"></div>');
                $('a[href="#' + file.name + '"]').tab('show');
            };
            reader.readAsText(file);
        } else {
            alert('The File APIs are not fully supported in this browser.');
        }
    });

    $('#tabs').find('a').on('click', function (e) {
        e.preventDefault();
        $(this).tab('show');
    });

    $('#message-tabs').find('a').on('click', function (e) {
        e.preventDefault();
        $(this).tab('show');
    });

    $(document).on('click', '.close-file', function (e) {
        var dataId = $(this).attr('data-id');
        bootbox.dialog({
            message: 'Do you want to save the file "' + dataId + '" before closing?',
            title: 'Close file ' + dataId,
            buttons: {
                success: {
                    label: "Close without saving",
                    className: "btn-danger",
                    callback: function() {
                        closeFile(Source.getMessageBySource(dataId).source);
                    }
                },
                danger: {
                    label: "Cancel",
                    className: "btn-warning"
                },
                main: {
                    label: "Save",
                    className: "btn-success",
                    callback: function() {
                        Source.setMessageContents(editor.getValue());
                        var source = Source.getMessageBySource(dataId);
                        saveWith(source.contents, source.source);
                        closeFile(source.source);
                    }
                }
            }
        });
    });

    function closeFile (name) {
        $('#li-' + name.replace('.', '\\.')).remove();
        $('#' + name.replace('.', '\\.')).remove();
        Source.removeSource(name);changeEditorLanguage('text');
        editor.setValue('');
        $('#outline').html('');
    }

    $(document).on('click', '.product-tab', function (e) {
        e.preventDefault();
        $(this).tab('show');
    });

    $(document).on('click', '.file-tab', function (e) {
        e.preventDefault();
        $(this).tab('show');
        Source.setMessageContents(editor.getValue());
        Source.loadSource($(this)[0].text.trim());
        var source = Source.getMessage();
        editor.setValue(source.contents);
        changeEditorLanguage(source.language);
    });

    $(document).on('change', '.discoverOption', function (e) {
        if (this.checked) {
            Sink.enableService(this.id);
        } else {
            Sink.disableService(this.id);
        }
        Sink.triggerAll();
    });

    changeEditorLanguage('text');

    $(document).on('click', '.editor-language', function (e) {
        changeEditorLanguage(e.target.text);
    });

    function changeEditorLanguage (language) {
        Monto.setEditorLanguage(language);
        Source.setMessageLanguage(language);
        $('#selected-editor-language').html(language);
    }

    var configLang = localStorage.getItem('config-language');
    $('#selected-config-language').html(configLang !== null && configLang !== undefined && configLang !== '' ? configLang : 'all');
    Discovery.setOptionsLanguage(configLang !== null && configLang !== undefined && configLang !== '' ? configLang : 'all');

    $(document).on('click', '.config-language', function (e) {
        var val = e.target.text;
        Discovery.setOptionsLanguage(val);
        localStorage.setItem("config-language", val);
        $('#selected-config-language').html(val);
    });

    setTimeout(function () {
        $('#discover').trigger('click');
    }, 100);

    $(document).on('change', '.config', function (e) {
        var id = (e.target.type === 'radio' ? e.target.name : e.target.id);
        var value = '';
        if (e.target.type === 'checkbox') {
            value = e.target.checked;
        } else if (e.target.type === 'number') {
            value = parseInt(e.target.value);
        } else if (e.target.type === 'text' || e.target.type === 'radio') {
            value = e.target.value;
        }
        localStorage.setItem(id, value);
        var idParts = e.target.id.split('-');
        Configuration.setConfiguration(idParts[0], idParts[1], value);
    });

    $(document).on('click', '.config-dropdown', function (e) {
        var value = e.target.text;
        var idParts = e.target.id.split('-');
        var id = idParts[0] + '-' + idParts[1];
        localStorage.setItem(id, value);
        Configuration.setConfiguration(idParts[0], idParts[1], value);
        $('#selected-' + id).html(value);
    });

    $('ul#tabs li:not(#tablist-options)').on('click', function (e) {
        Configuration.configureServices();
    });

    $(document).on('click', '#tablist-editor', function (e) {
        Source.send();
    });

    $(document).on('click', '.editor-language', function (e) {
        Sink.triggerAll();
        Source.send();
    });
};