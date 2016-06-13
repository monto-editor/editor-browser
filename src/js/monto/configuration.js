var Configuration = (function () {

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
            Source.sendConfiguration(configurationMsg.configure_services);
            $('#tab-configuration').html(Monto.toHtmlString(configurationMsg.configure_services));
        }
    }
})();
