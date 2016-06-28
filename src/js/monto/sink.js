var Sink = (function () {
    var sink;
    try {
        sink = new WebSocket('ws://localhost:5004/');
    } catch (e) {
        $('#con-btn').removeClass('btn-success').addClass('btn-danger');
        $('#con-glyph').removeClass('fa-check').addClass('fa fa-remove');
    }
    sink.onerror = function() {
        $('#con-btn').removeClass('btn-success').addClass('btn-danger');
        $('#con-glyph').removeClass('fa-check').addClass('fa fa-remove');
    };
    sink.onclose = function() {
        $('#con-btn').removeClass('btn-success').addClass('btn-danger');
        $('#con-glyph').removeClass('fa-check').addClass('fa fa-remove');
    };

    var triggerFunction = {};
    var products = {};

    sink.onmessage = function (rawMessage) {
        var msg = JSON.parse(rawMessage.data);
        switch(msg.tag) {
        case "product":
            processNewProduct(msg.contents);
            break;
        case "discovery":
            Discovery.acceptNewDiscoverResponse(msg.contents);
            break;
        default:
            console.log("unrecongnized message type "+msg);
        }
    };

    function processNewProduct(product) {
        var src = product.source;
        var prod = product.product;
        var productForSource = products[src];
        if (productForSource === undefined || productForSource === null) {
            products[src] = {};
        }
        var productForType = products[src][prod];
        if (productForType === undefined || productForType === null) {
            products[src][prod] = [product];
        } else {
            var index = -1;
            for (var i = 0; i < productForType.length; i++) {
                var existingProduct = productForType[i];
                if (existingProduct.service_id === product.service_id
                    && (existingProduct.source !== src || existingProduct.id < product.id)) {
                    index = i;
                }
            }
            if (index > -1) {
                products[src][prod][index] = product;
            } else {
                products[src][prod].push(product);
            }
        }
        var tabID = 'tab-' + product.service_id + '-' +  prod;
        if ($('#' + tabID).length > 0) {
            $('#'+tabID).html(Monto.toHtmlString(product));
        } else {
            $('#product-tabs').append('<li role="presentation"><a class="product-tab" href="#' + tabID + '">' + product.service_id + '/' + prod + '</a></li>');
            $('#product-div').append('<div role="tabpanel" id="' + tabID + '" class="tab-pane"></div>');
        }
        if (product.source === Source.getMessage().source) {
            Sink.trigger(prod);
        }
    }

    return {
        getActiveProductsByType: function (type) {
            var enabledProductsByType = [];
            var productsBySource = products[Source.getMessage().source];
            if (productsBySource === undefined || productsBySource === null) {
                return [];
            }
            var productsByType = productsBySource[type];
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
