var Discovery = (function () {
    var discovery;
    try {
        discovery = new WebSocket('ws://localhost:5006/');
    } catch (e) {
        $('#con-btn').removeClass('btn-success').addClass('btn-danger');
        $('#con-glyph').removeClass('fa-check').addClass('fa fa-remove');
    }
    discovery.onerror = function() {
        $('#con-btn').removeClass('btn-success').addClass('btn-danger');
        $('#con-glyph').removeClass('fa-check').addClass('fa fa-remove');
    };
    discovery.onclose = function() {
        $('#con-btn').removeClass('btn-success').addClass('btn-danger');
        $('#con-glyph').removeClass('fa-check').addClass('fa fa-remove');
    };

    discovery.onmessage = function (rawMessage) {
        acceptNewDiscoverResponse(JSON.parse(rawMessage.data));
    };

    var discoverReq = {
        discover_services: []
    };

    var discoverResponse = [];
    var languages = [];
    var optionLanguage = 'all';

    function acceptNewDiscoverResponse(response) {
        $('#discoverResponse').html(Monto.toHtmlString(response));
        discoverResponse = response;

        languages.forEach(function (language) {
            $('#editor-' + language).remove();
            $('#config-' + language).remove();
        });

        var foundLanguages = [];
        var foundServices = [];

        response.forEach(function (service) {
            service.products.forEach(function (product) {
                if (foundLanguages.indexOf(product.language) == -1) {
                    foundLanguages.push(product.language);
                    $('#editor-languages').append(sprintf('<li><a href="#" id="editor-%s" class="editor-language">%s</a></li>', product.language, product.language));
                    $('#config-languages').append(sprintf('<li><a href="#" id="config-%s" class="config-language">%s</a></li>', product.language, product.language));
                }
            });
            foundServices.push(service);
        });

        var configMsg = Configuration.getConfigurationMessage();
        Monto.getAvailableServices().forEach(function (service) {
            if (!foundServices.indexOf(service) > -1) {
                $('#row-' + service.service_id).remove();
                var serviceIndex = -1;
                configMsg.configure_services.forEach(function (config, index) {
                    if (config.service_id === service.service_id) {
                        serviceIndex = index;
                    }
                });
                configMsg.configure_services.splice(serviceIndex, 1);
            }
        });
        Configuration.setConfigurationMessage(configMsg);

        Monto.setAvailableServices(foundServices);
        languages = foundLanguages;
        buildServiceOptions();
        buildConfigurationOptions();
    }

    function buildServiceOptions() {
        Monto.getAvailableServices().forEach(function (service) {
            if (optionLanguage === 'all' || service.language === optionLanguage) {
                var tr = $('#row-' + service.service_id);
                if (tr.length === 0) {
                    var services = localStorage.getItem('selectedServices');
                    services = (services === '' || services === null || services === undefined) ? [] : JSON.parse(services);
                    var knownServices = localStorage.getItem('knownServices');
                    knownServices = (knownServices === '' || knownServices === null || knownServices === undefined) ? [] : JSON.parse(knownServices);
                    var checked = '';
                    if (knownServices.indexOf(service.service_id) === -1) {
                        checked = 'checked';
                        var serviceStr = localStorage.getItem('selectedServices');
                        var selectedServices = (serviceStr === '' || serviceStr === null || serviceStr === undefined) ? [] : JSON.parse(serviceStr);
                        selectedServices.push(service.service_id);
                        localStorage.setItem('selectedServices', JSON.stringify(selectedServices));
                        knownServices.push(service.service_id);
                        localStorage.setItem('knownServices', JSON.stringify(knownServices));
                    } else if (services.indexOf(service.service_id) > -1) {
                        checked = 'checked';
                        Monto.enableService(service.service_id);
                    }
                    var products = '';
                    service.products.forEach(function (product) {
                        products += product.language + '/' + product.product + ', ';
                    });
                    var products = products.slice(0, products.length-2);
                    $('#services').append(sprintf(
                        '<tr id="row-%s">' +
                        '<td class="mid-align">' +
                        '<div class="checkbox checkbox-primary">' +
                        '<input id="%s" type="checkbox" class="discoverOption styled" %s>' +
                        '<label for="%s"></label>' +
                        '</div>' +
                        '</td>' +
                        '<td class="mid-align">%s</td>' +
                        '<td class="mid-align">%s</td>' +
                        '<td class="mid-align">%s</td>' +
                        '</tr>'
                        , service.service_id, service.service_id, checked, service.service_id,
                        products, service.label, service.description));
                }
            } else {
                $('#row-' + service.service_id).remove();
            }
        });
    }

    function buildConfigurationOptions() {
        var configMsg = Configuration.getConfigurationMessage();
        Monto.getAvailableServices().forEach(function (service) {
            var panel = $('#options-' + service.service_id);
            var serviceConfig = [];
            if (service.options.length > 0) {
                var content = parseConfigurationOptions(service.options, service, serviceConfig, []);
                if (panel.length === 0) {
                    $('#options').append(content);
                }
                configMsg.configure_services.push({service_id: service.service_id, configurations: serviceConfig});
            }
        });
    }

    function parseConfigurationOptions(options, service, serviceConfig, required_options) {
        if (options !== undefined && options !== null) {
            var content = '<div id="options-' + service.service_id + '" class="panel panel-primary panel-default cm-s-monto"><div class="panel-body">';
            options.forEach(function (option) {
                var id = service.service_id + '-' + option.option_id;
                var config = localStorage.getItem(id);
                var value;
                var disabled = '';
                if (required_options !== null && required_options !== undefined && required_options.length > 0) {
                    var acc = true;
                    required_options.forEach(function (required_option) {
                        acc = 'true' === localStorage.getItem(service.service_id + '-' + required_option) && acc;
                        $(document).on('change', '#' + service.service_id + '-' + required_option, function (e) {
                            if (e.target.checked) {
                                $('#' + id).prop('disabled', false);
                            } else {
                                $('#' + id).prop('disabled', true);
                            }
                        });
                    });
                    disabled = acc ? '' : 'disabled';
                }
                if (option.type === "number") {
                    value = (config === null || config === undefined || config === '') ? option.default_value : parseInt(config);
                    content += buildNumberOption(config, option, id, disabled, value);
                } else if (option.type === "text") {
                    value = (config === null || config === undefined) ? option.default_value : config;
                    content += buildTextOption(config, option, id, disabled, value);
                } else if (option.type === "boolean") {
                    value = (config === null || config === undefined) ? option.default_value : 'true' === config;
                    content += buildBooleanOption(config, option, id, disabled, value);
                } else if (option.type === "xor") {
                    value = (config === null || config === undefined || config === '') ? option.default_value : config;
                    content += buildXorOption(config, option, id, disabled, value);
                } else if (option.type === undefined && option.members !== undefined) {
                    content += buildGroupOption(option, required_options, service, serviceConfig);
                }

                if (option.type !== undefined && option.members === undefined) {
                    serviceConfig.push({option_id: option.option_id, value: value});
                }
            });
            content += '</div></div>';
            return content;
        }
    }

    function buildNumberOption(config, option, id, disabled, value) {
        localStorage.setItem(id, value);
        return sprintf(
            '<div>' +
            '<input type="number" class="config" id="%s" placeholder="%s" min="%s" max="%s" value="%s" %s> %s' +
            '</div>'
            , id, option.default_value, option.from, option.to, value, disabled, option.label
        );
    }

    function buildTextOption(config, option, id, disabled, value) {
        localStorage.setItem(id, value);
        return sprintf(
            '<div>' +
            '<input type="text" class="config" id="%s" placeholder="%s" value="%s" %s> %s' +
            '</div>'
            , id, option.default_value, value, disabled, option.label
        );
    }

    function buildBooleanOption(config, option, id, disabled, value) {
        localStorage.setItem(id, value);
        return sprintf(
            '<div class="checkbox checkbox-primary">' +
            '<input type="checkbox" class="config styled" id="%s" %s %s>' +
            '<label for="%s">%s</label>' +
            '</div>'
            , id, value ? 'checked ' : '', disabled, id, option.label
        );
    }

    function buildXorOption(config, option, id, disabled, value) {
        localStorage.setItem(id, value);
        var content = sprintf(
            '<div class="btn-group">' +
            '<button id="%s" type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" %s>' +
            '<span id="selected-%s">%s</span>' +
            '<span class="caret"></span>' +
            '</button>' +
            '<ul id="%s-options" class="dropdown-menu">'
            , id, disabled, id, value, id
        );
        option.values.forEach(function (xorOption, value) {
            content += sprintf(
                '<li><a href="#" id="%s-%s" class="config-dropdown %s-option">%s</a></li>'
                , id, xorOption, id, xorOption
            );
        });
        content += '</ul></div> ' + option.label;
        return content;
    }

    function buildGroupOption(option, required_options, service, serviceConfig) {
        required_options.push(option.required_option);
        var content = parseConfigurationOptions(option.members, service, serviceConfig, required_options);
        var index = required_options.indexOf(option.required_option);
        if (index > -1) {
            required_options.splice(index, 1);
        }
        return content;
    }

    return {
        discoverServices: function () {
            discovery.send(JSON.stringify(discoverReq));
            $('#discoverRequest').html(Monto.toHtmlString(discoverReq));
        },
        setOptionsLanguage: function (language) {
            optionLanguage = language;
            buildServiceOptions();
        }
    }
})();