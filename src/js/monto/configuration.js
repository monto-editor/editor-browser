var Configuration = (function () {
    var configuration;
    try {
        configuration = new WebSocket('ws://localhost:5008/');
    } catch (e) {
        $('#con-btn').removeClass('btn-success').addClass('btn-danger');
        $('#con-glyph').removeClass('fa-check').addClass('fa fa-remove');
    }
    configuration.onerror = function () {
        $('#con-btn').removeClass('btn-success').addClass('btn-danger');
        $('#con-glyph').removeClass('fa-check').addClass('fa fa-remove');
    };
    configuration.onclose = function () {
        $('#con-btn').removeClass('btn-success').addClass('btn-danger');
        $('#con-glyph').removeClass('fa-check').addClass('fa fa-remove');
    };

    var configurationMsg = {
        configure_services: []
    };

    return {
        getConfigurationMessage: function () {
            return configurationMsg;
        },
        setConfigurationMessage: function (value) {
            configurationMsg = value;
        },
        setConfiguration: function (serviceID, optionID, value) {
            configurationMsg.configure_services.forEach(function (service) {
                if (service.service_id === serviceID) {
                    service.configurations.forEach(function (config) {
                        if (config.option_id === optionID) {
                            config.value = value;
                        }
                    });
                }
            });
        },
        configureServices: function () {
            configuration.send(JSON.stringify(configurationMsg));
            $('#tab-configuration').html(Monto.toHtmlString(configurationMsg));
        }
    }
})();