(function (mod) {
    mod(CodeMirror);
})(function (CodeMirror) {
    "use strict";

    Sink.onTypeTriggerFunction('completions', function () {
        CodeMirror.commands.autocomplete($('.CodeMirror')[0].CodeMirror);
    });

    CodeMirror.registerHelper('hint', 'monto', function (editor, options) {
        var list = [];
        var completions = Sink.getActiveProductsByType("completions");
        if (completions === undefined || completions === null || completions.length === 0 || completions[0].contents.length === 0) {
            return {
                list: []
            };
        }
        var lastSelectionPos = Source.getLastSelectionPos();
        var pos = {
            from: lastSelectionPos.begin,
            to: lastSelectionPos.end
        };
        completions.forEach(function (completion) {
            var contents = completion.contents;
            contents.forEach(function (content) {
                list.push(content.replacement);
            });
        });
        Source.resetMessageSelections();
        return {
            list: list,
            from: CodeMirror.Pos(pos.from.line, pos.from.ch),
            to: CodeMirror.Pos(pos.to.line, pos.to.ch)
        };
    });
});
