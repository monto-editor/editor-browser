var Sink = (function () {
    var sink;
    try {
        sink = new WebSocket('ws://localhost:5003/');
    } catch (e) {
        $('#con-btn').removeClass('btn-success').addClass('btn-danger');
        $('#con-glyph').removeClass('fa-check').addClass('fa-remove');
    }
    sink.onerror = function() {
        $('#con-btn').removeClass('btn-success').addClass('btn-danger');
        $('#con-glyph').removeClass('fa-check').addClass('fa-remove');
    };
    sink.onclose = function() {
        $('#con-btn').removeClass('btn-success').addClass('btn-danger');
        $('#con-glyph').removeClass('fa-check').addClass('fa-remove');
    };

    var parse = false;
    var skip = false;
    var parseService = "";

    var triggerFunction = {};

    var products = {};

    sink.onmessage = function (rawMessage) {
        if (parse) {
            var message = JSON.parse(rawMessage.data);
            if (message.product !== undefined) {
                processNewProduct(message);
            }
            parse = false;
            parseService = "";
        } else if (!skip) {
            if (Monto.isServiceEnabled(rawMessage.data.split(' ')[3])) {
                parse = true;
                parseService = rawMessage.data.split(' ')[3];
            } else {
                skip = true;
            }
        } else {
            skip = false;
        }
    };

    function processNewProduct(product) {
        var productForType = products[product.product];
        if (productForType === undefined || productForType === null) {
            products[product.product] = [product];
        } else {
            var index = -1;
            for (var i = 0; i < productForType.length; i++) {
                var existingProduct = productForType[i];
                if (existingProduct.service_id === product.service_id
                    && (existingProduct.source !== product.source || existingProduct.version_id < product.version_id)) {
                    index = i;
                }
            }
            if (index > -1) {
                products[product.product][index] = product;
            } else {
                products[product.product].push(product);
            }
        }
        var tabID = 'tab-' + product.service_id + '-' +  product.product;
        $('#products-tabs').append('<li role="presentation"><a class="product-tab" href="#' + tabID + '">' + product.service_id + '/' + product.product + '</a></li>');
        $('#products-div').append('<div role="tabpanel" id="' + tabID + '" class="tab-pane"></div>');
        $('#'+tabID).html(Monto.toHtmlString(product));
        Sink.trigger(product.product);
    }

    return {
        getProducts: function () {
            return products;
        },
        getProductsByType: function (type) {
            return products[type];
        },
        getActiveProductsByType: function (type) {
            var enabledProductsByType = [];
            var productsByType = products[type];
            if (productsByType === undefined || productsByType === null) {
                return [];
            }
            productsByType.forEach(function (product) {
                var serviceAvailable = false;
                Monto.getAvailableServices().forEach(function (service) {
                    if (service.service_id === product.service_id) {
                        serviceAvailable = true;
                    }
                });
                if (serviceAvailable && Monto.isServiceEnabled(product.service_id) && product.language === Source.getMessage().language) {
                    enabledProductsByType.push(product);
                }
            });
            return enabledProductsByType;
        },
        getProductByServiceID: function (serviceID) {
            for (var i in products) {
                for (var j in products[i]) {
                    if (products[i][j].service_id === serviceID) {
                        return products[i][j];
                    }
                }
            }
            return null;
        },
        resetProducts: function () {
            products = {};
        },
        onTypeTriggerFunction: function (productType, func) {
            var list = triggerFunction[productType];
            if (list === undefined || list === null) {
                triggerFunction[productType] = [func];
            } else {
                triggerFunction[productType].push(func);
            }
        },
        trigger: function (productType) {
            var list = triggerFunction[productType];
            if (list === undefined || list === null) {
                return;
            }
            triggerFunction[productType].forEach(function (func) {
                func();
            });
        },
        triggerAll: function () {
            for (var product in triggerFunction) {
                if (product === 'completions') {
                    continue;
                }
                triggerFunction[product].forEach(function (func) {
                    func();
                });
            }
        },
        enableService: function (serviceID) {
            if (!Monto.isServiceEnabled(serviceID)) {
                Monto.enableService(serviceID);
                var serviceStr = localStorage.getItem('selectedServices');
                var services = (serviceStr === '' || serviceStr === null || serviceStr === undefined) ? [] : JSON.parse(serviceStr);
                services.push(serviceID);
                localStorage.setItem('selectedServices', JSON.stringify(services));
            }
        },
        disableService: function (serviceID) {
            if (Monto.isServiceEnabled(serviceID)) {
                Monto.disableService(serviceID);
                var serviceStr = localStorage.getItem('selectedServices');
                var services = (serviceStr === '' || serviceStr === null || serviceStr === undefined) ? [] : JSON.parse(serviceStr);
                services.splice(services.indexOf(serviceID), 1);
                localStorage.setItem('selectedServices', JSON.stringify(services));
            }
        }
    };
})();
