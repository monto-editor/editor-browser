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
                    service.settings.forEach(function (setting) {
                        if (setting.option_id === optionID) {
                            setting.value = value;
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
