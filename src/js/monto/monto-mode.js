(function (mod) {
    mod(CodeMirror);
})(function (CodeMirror) {
    'use strict';

    CodeMirror.defineMode('monto', function () {
        // get instance of editor
        var editor = $('.CodeMirror')[0].CodeMirror;
        var markers = [];
        var cursor;

        editor.on('cursorActivity', function (cm) {
            // always keep track of the current cursor position
            cursor = cm.getCursor();
        });

        editor.on('change', function (cm, change) {
            Monto.refreshLineSizes(cm.getValue());
            Source.setMessageContents(cm.getValue());
            Source.send();
        });

        Sink.onTypeTriggerFunction('tokens', function () {
            editor.operation(function () {
                markers.forEach(function (marker) {
                    marker.clear();
                });
                var tokens = Sink.getActiveProductsByType("tokens");
                tokens.forEach(function (product) {
                    var contents = product.contents;
                    contents.forEach(function (content) {
                        var pos = Monto.convertMontoToCMPosWithLength({
                            offset: content.offset,
                            length: content.length
                        });
                        markers.push(editor.markText({line: pos.from.line, ch: pos.from.ch}, {
                            line: pos.to.line,
                            ch: pos.to.ch
                        }, {className: 'cm-' + content.category}));
                    });
                });
            });
        });

        Sink.onTypeTriggerFunction('outline', function () {
            var content = '';
            var outlines = Sink.getActiveProductsByType('outline');
            outlines.forEach(function (product) {
                content += refreshOutline(product.contents.children)
            });
            $('#outline').html(content);
        });

        function refreshOutline(children) {
            if (typeof children === 'undefined' || children === null) {
                return '';
            }
            var outline = '<ul class="outline" compact>';
            children.forEach(function (child) {
                outline += sprintf('<li><img src="%s">%s %s</li>', child.icon, child.label, refreshOutline(child.children));
            });
            outline += '</ul>';
            return outline;
        }

        return {
            token: function (stream) {
                stream.skipToEnd();
                return '';
            }
        };
    });
});
