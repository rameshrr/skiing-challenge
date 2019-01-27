const ElevationData = require('./elevation-data');
const NodeData = require('./node-data');

module.exports = {

    getClosestNode: function (nodes, goal) {
        let closest = Number.MAX_SAFE_INTEGER;
        let index = -1;

        nodes.forEach((node, i) => {
            let dist = goal - node.value;

            if (dist > 0 && dist < closest) {
                index = i;
                closest = dist;
            }
        });

        return nodes[index] || null;
    },

    getClosestNodes: function (nodes, currentValue) {
        const closestNodes = nodes.filter(node => node.value && node.value < currentValue);
        const closestNodesData = closestNodes.map(node => new ElevationData({ ...node, currentValue }));

        return new NodeData(currentValue, closestNodesData);
    }
}
