/**
 * Generates implicit relationships (2nd and 3rd degree connections) based on explicit links.
 * 
 * Rules:
 * 1. Explicit connection (1st degree) -> Category 1 (Pre-existing type preserved)
 * 2. 2nd degree connection -> Category 2
 * 3. 3rd degree connection -> Category 3
 * 4. Priority: 1 > 2 > 3 (If a 1st degree link exists, we don't show it as 2nd degree)
 * 
 * @param {Array} nodes - List of node objects { id, ... }
 * @param {Array} explicitLinks - List of link objects { source, target, type, ... }
 * @returns {Array} - Combined list of links including explicit and generated implicit ones
 */
export const generateImplicitLinks = (nodes, explicitLinks) => {
    // 1. Build Adjacency List
    const adj = {};
    nodes.forEach(node => {
        adj[node.id] = [];
    });

    // Helper to get ID safely whether it's an object or string
    const getId = (val) => (typeof val === 'object' && val !== null ? val.id : val);

    explicitLinks.forEach(link => {
        const s = getId(link.source);
        const t = getId(link.target);
        if (adj[s] && adj[t]) {
            adj[s].push(t);
            adj[t].push(s);
        }
    });

    // Set of existing pairs to quickly check 1st degree
    const existingPairs = new Set();
    explicitLinks.forEach(link => {
        const s = getId(link.source);
        const t = getId(link.target);
        existingPairs.add(`${s}-${t}`);
        existingPairs.add(`${t}-${s}`);
    });

    const allLinks = [...explicitLinks.map(l => ({ ...l, category: 1 }))];

    // 2. BFS for every node to find 2nd and 3rd degree connections
    // We only need to iterate unique pairs. To avoid duplicates and self-loops:
    // We can iterate all nodes as start nodes.

    const generatedPairs = new Set(); // To avoid adding A-B and B-A twice for implicit links

    for (let i = 0; i < nodes.length; i++) {
        const startNode = nodes[i].id;

        // BFS initialization
        const distances = {}; // nodeID -> distance
        const queue = [[startNode, 0]];
        distances[startNode] = 0;

        while (queue.length > 0) {
            const [current, dist] = queue.shift();

            if (dist >= 3) continue; // We only care up to degree 3, so checking neighbors of dist=2 is enough logic-wise, but we stop if we reached max depth needed

            const neighbors = adj[current] || [];
            for (const neighbor of neighbors) {
                if (distances[neighbor] === undefined) { // Not visited
                    distances[neighbor] = dist + 1;
                    queue.push([neighbor, dist + 1]);

                    // Process connection logic here
                    // We found a node 'neighbor' at distance 'dist + 1' from 'startNode'
                    const newDist = dist + 1;

                    // We only care about Distance 2 and 3
                    if (newDist === 2 || newDist === 3) {
                        // Check if 1st degree already exists (should be covered by BFS implicit logic but good to double check priority)
                        // Actually, BFS naturally finds shortest path. 
                        // If A-B exists (dist 1), we won't process B as dist 2 or 3 for A.
                        // So we just need to verify we only add one link per pair.

                        // Canonical pair key
                        const n1 = startNode < neighbor ? startNode : neighbor;
                        const n2 = startNode < neighbor ? neighbor : startNode;
                        const pairKey = `${n1}-${n2}`;

                        if (!generatedPairs.has(pairKey) && !existingPairs.has(pairKey)) {
                            generatedPairs.add(pairKey);
                            allLinks.push({
                                source: startNode,
                                target: neighbor,
                                type: newDist === 2 ? 'second_degree' : 'third_degree',
                                category: newDist
                            });
                        }
                    }
                }
            }
        }
    }

    return allLinks;
};
