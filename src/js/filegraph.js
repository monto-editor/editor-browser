var FileGraph = (function () {
    var data = {
        nodes: [],
        edges: []
    };

    var options = {
        height: "768px",
        layout: {
            randomSeed: 691999
            //hierarchical: {
            //    //sortMethod: "directed",
            //    direction: "UD"
            //}
        },
        edges: {
            arrows: {to: true},
            physics: false
        },
        nodes: {
            shape: "box",
            physics: false
        }
    };

    var network;

    function addNode(id, label) {
        var node = {id: id, label: label};
        if (data.nodes.indexOf(node) === -1) {
            data.nodes.push(node);
        }
    }

    function addEdge(from, to) {
        var edge = {from: from, to: to};
        if (data.edges.indexOf(edge) === -1) {
            data.edges.push(edge);
        }
    }

    function draw(container) {
        data.nodes = [];
        data.edges = [];
        var products = Sink.getActiveProductsByType('filegraph');
        products.forEach(function (product) {
            if (product.source === Source.getMessage().source) {
                var files = product.contents;
                files.forEach(function (file) {
                    var name = file.file_name;
                    addNode(name, name);
                    file.dependencies.forEach(function (dependency) {
                        addEdge(name, dependency);
                    });
                });
            }
        });

        network = new vis.Network(document.getElementById(container), data, options);
        console.log("drawing graph");
    }

    return {
        draw: draw
    };
})();