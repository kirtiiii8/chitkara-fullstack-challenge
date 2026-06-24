const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

function buildTree(node, graph) {
    let result = {};

    if (!graph[node]) return result;

    for (let child of graph[node]) {
        result[child] = buildTree(child, graph);
    }

    return result;
}

function getDepth(node, graph) {
    if (!graph[node]) return 1;

    let maxDepth = 0;

    for (let child of graph[node]) {
        maxDepth = Math.max(maxDepth, getDepth(child, graph));
    }

    return maxDepth + 1;
}


app.post("/bfhl", (req, res) => {

    const data = req.body.data || [];

    let invalid_entries = [];
    let validEdges = [];

    const regex = /^[A-Z]->[A-Z]$/;

    for (let item of data) {

        item = item.trim();

        if (!regex.test(item)) {
            invalid_entries.push(item);
            continue;
        }

        const [parent, child] = item.split("->");

        if (parent === child) {
            invalid_entries.push(item);
            continue;
        }

        validEdges.push(item);
    }

    const edgeSet = new Set();
    const duplicate_edges = [];
    const uniqueEdges = [];

    for (let edge of validEdges) {

        if (edgeSet.has(edge)) {

            if (!duplicate_edges.includes(edge)) {
                duplicate_edges.push(edge);
            }

        } else {
            edgeSet.add(edge);
            uniqueEdges.push(edge);
        }
    }

    const graph = {};
    const parentSet = new Set();
    const childSet = new Set();

    for (let edge of uniqueEdges) {

        const [parent, child] = edge.split("->");

        if (!graph[parent]) {
            graph[parent] = [];
        }

        graph[parent].push(child);

        parentSet.add(parent);
        childSet.add(child);
    }

    const roots = [...parentSet].filter(
        node => !childSet.has(node)
    );

    const hierarchies = [];

    let largestDepth = 0;
    let largestRoot = "";

    for (let root of roots) {

        const tree = {
            [root]: buildTree(root, graph)
        };

        const depth = getDepth(root, graph);

        hierarchies.push({
            root,
            tree,
            depth
        });

        if (
            depth > largestDepth ||
            (depth === largestDepth && root < largestRoot)
        ) {
            largestDepth = depth;
            largestRoot = root;
        }
    }

    res.json({
        user_id: "Kirtivashishat_22012005",
        email_id: "kirti0717.be23@chitkara.edu.in",
        college_roll_number: "2310990717",

        hierarchies,

        invalid_entries,

        duplicate_edges,

        summary: {
            total_trees: hierarchies.length,
            total_cycles: 0,
            largest_tree_root: largestRoot
        }
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server Running On Port ${PORT}`);
});
