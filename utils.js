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

        let i = 0;

        nodes = nodes.sort((first, second) => {
            if (first.value < second.value) {
                return -1;
            } else if (first.value > second.value) {
                return 1;
            }

            return 0;
        });

        if (nodes[i].value > goal) return null;

        while (nodes[++i] && nodes[i - 1].value < goal);

        return nodes[--i];
    }
}
