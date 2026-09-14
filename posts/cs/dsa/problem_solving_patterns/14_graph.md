---
title: Problem Patterns - 14. Graph pattern
era: Pattern type 14 
readTime: 10 min read
excerpt: 
floats: bulb.png, cpu.png, gpu.png, keyboard.png, monitor.png, ram.png, star_yellow.png
background: cs/dsa.png
---
# 14. Graphs
### 1. [Construct Adjancency List from EDGES+Nodes](https://www.geeksforgeeks.org/problems/print-adjacency-list-1587115620/1)
### 2. [Graph DFS](https://www.geeksforgeeks.org/problems/depth-first-traversal-for-a-graph/1)
### 3. [Graph BFS](https://www.geeksforgeeks.org/problems/bfs-traversal-of-graph/1)

Given a connected undirected graph containing `V` vertices, represented by a 2-d adjacency list `adj[][]`, where each `adj[i]` represents the list of vertices connected to vertex `i`.

Perform a Breadth First Search (BFS) traversal starting from vertex 0, visiting vertices from left to right according to the given adjacency list, and return a list containing the BFS traversal of the graph.

Note: Do traverse in the same order as they are in the given adjacency list.

Examples:

Input: adj[][] = [[2, 3, 1], [0], [0, 4], [0], [2]]

```
2-------- 0 ---------- 1
|         |
|         |
|         3
4
```

**Output:** [0, 2, 3, 1, 4]

**Explanation:** Starting from 0, the BFS traversal will follow these steps: 
- Visit 0 → Output: 0 
- Visit 2 (first neighbor of 0) → Output: 0, 2 
- Visit 3 (next neighbor of 0) → Output: 0, 2, 3 
- Visit 1 (next neighbor of 0) → Output: 0, 2, 3, 1
- Visit 4 (neighbor of 2) → Final Output: 0, 2, 3, 1, 4

```cpp
class Solution {
	public:
	vector<int> bfs(vector<vector<int>> &adj) {
	    int V = adj.size();
		vector<bool> visited(V, false);
		queue<int> q;
		
		vector<int> ans;
		
		visited[0] = true;
		q.push(0);
		
		while (!q.empty()) {
			int current = q.front(); // returns the oldest element of q without removing
			q.pop(); // removes the oldest element of the q without returning it.
			
			ans.push_back(current);
			
			for (int x : adj[current]) {
				if (!visited[x]) {
					visited[x] = true;
					q.push(x);
				}
			}
		}
		return ans;
		
	}
};

```

### 4. [Number of Islands](https://leetcode.com/problems/number-of-islands/description/)
### 5. [Number of Provinces](https://leetcode.com/problems/number-of-provinces/description/)
### 6. [Rotten Oranges](https://leetcode.com/problems/rotting-oranges/)
### 7. [Cycle detection in undirected graph](https://www.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1)
### 8. [Cycle detection in directed graph](https://www.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1)
### 9. [Topological sort](https://www.geeksforgeeks.org/problems/topological-sort/1)
### 10. [Bipartite Graph/ Graph Coloring](https://leetcode.com/problems/is-graph-bipartite/)
### 11. [Surrounded Regoins](https://leetcode.com/problems/surrounded-regions/)
### 12. [Shortest Path in Non-Weighted Graph](https://www.geeksforgeeks.org/problems/shortest-path-in-undirected-graph-having-unit-distance/1)
### 13. [Dijkstra's Algorithm](https://www.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1)
### 14. [Network Delay](https://leetcode.com/problems/network-delay-time/)
### 15. [Path With Minimum Effort](https://leetcode.com/problems/path-with-minimum-effort/)
### 16. [Swim in Rising Water](https://leetcode.com/problems/swim-in-rising-water/)
### 17. [Bellman ford](https://www.geeksforgeeks.org/problems/distance-from-the-source-bellman-ford-algorithm/1)
### 18. [Cheapest Path in K stops](https://leetcode.com/problems/cheapest-flights-within-k-stops/description/)
### 19. [Prim MST](https://www.geeksforgeeks.org/problems/minimum-spanning-tree/1)
### 20. [Word Ladder](https://leetcode.com/problems/word-ladder/)