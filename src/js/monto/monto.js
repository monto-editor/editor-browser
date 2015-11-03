var Monto = (function () {

    var lineSizes = [];
    var language = localStorage.getItem('editor-language');

    var enabledServices = ["discover"];
    var availableServices = [];


    return {
        setEditorLanguage: function (value) {
            Sink.resetProducts();
            language = value;
        },
        getAvailableServices: function () {
            return availableServices;
        },
        setAvailableServices: function (services) {
            availableServices = services;
        },
        enableService: function (service) {
            if (enabledServices.indexOf(service) === -1) {
                enabledServices.push(service);
            }
        },
        disableService: function (service) {
            var index = enabledServices.indexOf(service);
            if (index > -1) {
                enabledServices.splice(index, 1);
            }
        },
        isServiceEnabled: function (service) {
            return enabledServices.indexOf(service) > -1;
        },
        getLineSizes: function () {
            return lineSizes;
        },
        refreshLineSizes: function (content) {
            var lines = content.split('\n');
            lineSizes = [];
            lines.forEach(function (line) {
                lineSizes.push(line.length);
            });
        },
        convertMontoToCMPosWithLength: function (pos) {
            //converts positions from  {offset, length} to {{line, ch},{line,ch}}
            var chCount = 0;
            for (var i = 0; i < lineSizes.length; i++) {
                if (pos.offset < chCount + lineSizes[i] + 1) {
                    return {
                        from: {line: i, ch: pos.offset - chCount},
                        to: {line: i, ch: pos.offset - chCount + pos.length}
                    };
                }
                chCount += lineSizes[i] + 1;
            }
        },
        convertMontoToCMPos: function (offset) {
            //converts positions from  offset to {line, ch}
            var chCount = 0;
            for (var i = 0; i < lineSizes.length; i++) {
                if (offset < chCount + lineSizes[i] + 1) {
                    return {
                        line: i,
                        ch: offset - chCount
                    };
                }
                chCount += lineSizes[i] + 1;
            }
        },
        convertCMToMontoPos: function (pos) {
            //converts positions from  {line, ch} to offset
            var chCount = -1;
            for (var i = 0; i <= pos.line; i++) {
                var lineSize = lineSizes[i];
                if (i === pos.line) {
                    chCount += pos.ch;
                } else {
                    chCount += lineSize;
                }
                chCount += 1;
            }
            return chCount;
        },
        toHtmlString: function (content) {
            return '<pre>' + JSON.stringify(content, null, 2).replace('<', '&lt').replace('>', '&gt') + '</pre>';
        }
    }

})();
