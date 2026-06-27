const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── CONFIG ── fill these in before submitting ──────────────────────────────
const USER_ID = 'namankumar-25012006';
const EMAIL_ID = 'naman0664.be23@chitkara.edu.in';
const ROLL_NUMBER = '2310990664';
// ──────────────────────────────────────────────────────────────────────────

const VALID_EDGE = /^[A-Z]->[A-Z]$/;

function processData(data) {
  const invalid_entries = [];
  const duplicate_edges = [];
  const seenEdges = new Set();
  const validEdges = [];

  for (let raw of data) {
    const entry = raw.trim();
    if (!VALID_EDGE.test(entry)) {
      invalid_entries.push(raw);
      continue;
    }
    const [parent, child] = entry.split('->');
    if (parent === child) { // self-loop
      invalid_entries.push(raw);
      continue;
    }
    if (seenEdges.has(entry)) {
      if (!duplicate_edges.includes(entry)) {
        duplicate_edges.push(entry);
      }
      continue;
    }
    seenEdges.add(entry);
    validEdges.push([parent, child]);
  }

  // Build adjacency: first-parent-wins for multi-parent
  const parentOf = new Map(); // child -> parent (first one wins)
  const children = new Map(); // parent -> [children]

  for (const [p, c] of validEdges) {
    if (!parentOf.has(c)) {
      parentOf.set(c, p);
      if (!children.has(p)) children.set(p, []);
      children.get(p).push(c);
    }
    // else: subsequent parent edge silently discarded
  }

  // All nodes
  const allNodes = new Set();
  for (const [p, c] of validEdges) {
    allNodes.add(p);
    allNodes.add(c);
  }

  // Find roots: nodes that never appear as a child
  const childNodes = new Set(parentOf.keys());
  const roots = [...allNodes].filter(n => !childNodes.has(n)).sort();

  // Group nodes into connected components using union-find
  const parent = {};
  for (const n of allNodes) parent[n] = n;

  function find(x) {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }
  function union(a, b) {
    parent[find(a)] = find(b);
  }

  for (const [p, c] of validEdges) union(p, c);

  // Group nodes by component
  const components = new Map();
  for (const n of allNodes) {
    const r = find(n);
    if (!components.has(r)) components.set(r, new Set());
    components.get(r).add(n);
  }

  // For each component find its root(s)
  const processed = new Set();
  const hierarchies = [];

  for (const [, nodeSet] of components) {
    const compNodes = [...nodeSet];
    const compRoots = compNodes.filter(n => roots.includes(n)).sort();

    if (compRoots.length === 0) {
      // Pure cycle — pick lex smallest as root
      const cycleRoot = compNodes.sort()[0];
      hierarchies.push({ root: cycleRoot, tree: {}, has_cycle: true });
    } else {
      for (const root of compRoots) {
        if (processed.has(root)) continue;
        // DFS to build tree and detect cycle
        const { tree, depth, hasCycle } = buildTree(root, children, new Set());
        if (hasCycle) {
          hierarchies.push({ root, tree: {}, has_cycle: true });
        } else {
          hierarchies.push({ root, tree, depth });
        }
        processed.add(root);
      }
    }
  }

  // Summary
  const nonCyclic = hierarchies.filter(h => !h.has_cycle);
  const cyclic = hierarchies.filter(h => h.has_cycle);
  let largest_tree_root = '';
  if (nonCyclic.length > 0) {
    const maxDepth = Math.max(...nonCyclic.map(h => h.depth));
    const candidates = nonCyclic.filter(h => h.depth === maxDepth).map(h => h.root).sort();
    largest_tree_root = candidates[0];
  }

  return {
    user_id: USER_ID,
    email_id: EMAIL_ID,
    college_roll_number: ROLL_NUMBER,
    hierarchies,
    invalid_entries,
    duplicate_edges,
    summary: {
      total_trees: nonCyclic.length,
      total_cycles: cyclic.length,
      largest_tree_root
    }
  };
}

function buildTree(node, children, visiting) {
  if (visiting.has(node)) return { tree: {}, depth: 0, hasCycle: true };
  visiting.add(node);

  const kids = children.get(node) || [];
  const subtree = {};
  let maxChildDepth = 0;

  for (const child of kids) {
    const result = buildTree(child, children, new Set(visiting));
    if (result.hasCycle) return { tree: {}, depth: 0, hasCycle: true };
    subtree[child] = result.tree[child] || {};
    maxChildDepth = Math.max(maxChildDepth, result.depth);
  }

  return { tree: { [node]: subtree }, depth: 1 + maxChildDepth, hasCycle: false };
}

app.post('/bfhl', (req, res) => {
  try {
    const { data } = req.body;
    if (!Array.isArray(data)) return res.status(400).json({ error: 'data must be an array' });
    res.json(processData(data));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
module.exports = app;
