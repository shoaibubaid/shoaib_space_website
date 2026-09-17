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

Given `V` vertices numbered `0` to `V-1` and a list of undirected `edges`, build and return the adjacency list representation of the graph.

```cpp
class Solution {
public:
    vector<vector<int>> printGraph(int V, vector<vector<int>>& edges) {
        vector<vector<int>> adj(V);

        for(auto& edge : edges) {
            int u = edge[0];
            int v = edge[1];

            adj[u].push_back(v);
            adj[v].push_back(u);
        }

        return adj;
    }
};
```

### 2. [Graph DFS](https://www.geeksforgeeks.org/problems/depth-first-traversal-for-a-graph/1)

Given a connected undirected graph as an adjacency list `adj`, perform a Depth First Search starting from vertex `0` and return the nodes in the order visited.

```cpp
class Solution {
public:
    void dfs(int node, vector<vector<int>>& adj, vector<bool>& visited, vector<int>& ans) {
        visited[node] = true;
        ans.push_back(node);

        for(int neighbor : adj[node]) {
            if(!visited[neighbor]) {
                dfs(neighbor, adj, visited, ans);
            }
        }
    }

    vector<int> dfsOfGraph(vector<vector<int>>& adj) {
        int V = adj.size();
        vector<bool> visited(V, false);
        vector<int> ans;

        dfs(0, adj, visited, ans);

        return ans;
    }
};
```

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

Given an `m x n` 2D binary grid `grid` which represents a map of `'1'`s (land) and `'0'`s (water), return the number of islands.

An **island** is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.

**Example 1:**


```
Input:
    grid = [
        ["1","1","1","1","0"],
        ["1","1","0","1","0"],
        ["1","1","0","0","0"],
        ["0","0","0","0","0"]
    ]

Output: 1
```



```cpp
class Solution {
public:
    int numIslands(vector<vector<char>>& grid) {
        int m = grid.size();
        int n = grid[0].size();
        int count = 0;

        vector<vector<bool>> visited(m,vector<bool>(n,false));
        queue<vector<int>> q;
        vector<vector<int>> surround_array = {{-1,0}, {0, 1},{1,0}, {0, -1}};
            

        for(int i = 0; i < m; i++){
            for(int j = 0; j < n; j++){
                if(grid[i][j] == '1'){
                    if(!visited[i][j]){
                        visited[i][j] = true;
                        q.push({i,j});
                        count++;

                        while(!q.empty()){
                            vector<int> curr = q.front();
                            q.pop();
                            // curr[0], curr[1] == indices of the popped
                           
                            for(vector<int> surround : surround_array){
                                int x = curr[0] + surround[0];
                                int y = curr[1] + surround[1];
                            
                                if(x >= 0 && x < m && y >=0 && y < n){
                                    if(grid[x][y] == '1' && visited[x][y] == false){
                                        visited[x][y] = true;
                                        q.push({x,y});
                                    } 
                                }
                            }
                        }
                    }
                }
            }
        }
        return count;
    }
};
```

### 5. [Number of Provinces](https://leetcode.com/problems/number-of-provinces/description/)

There are `n` cities. `isConnected` is an `n x n` matrix where `isConnected[i][j] = 1` if city `i` and city `j` are directly connected, and `0` otherwise. A **province** is a group of directly or indirectly connected cities. Return the total number of provinces.

```cpp
class Solution {
public:
    void dfs(int city, vector<vector<int>>& isConnected, vector<bool>& visited) {
        visited[city] = true;

        for(int j = 0; j < isConnected.size(); j++) {
            if(isConnected[city][j] == 1 && !visited[j]) {
                dfs(j, isConnected, visited);
            }
        }
    }

    int findCircleNum(vector<vector<int>>& isConnected) {
        int n = isConnected.size();
        vector<bool> visited(n, false);
        int provinces = 0;

        for(int i = 0; i < n; i++) {
            if(!visited[i]) {
                dfs(i, isConnected, visited);
                provinces++;
            }
        }

        return provinces;
    }
};
```

### 6. [Rotten Oranges](https://leetcode.com/problems/rotting-oranges/)
You are given an `m x n` grid where each cell can have one of three values:

- 0 representing an empty cell,
- 1 representing a fresh orange, or
- 2 representing a rotten orange.

Every minute, any fresh orange that is 4-directionally adjacent to a rotten orange becomes rotten.

Return the minimum number of minutes that must elapse until no cell has a fresh orange. If this is impossible, return `-1`.

```cpp
class Solution {
public:
    int orangesRotting(vector<vector<int>>& grid) {
        int m = grid.size();
        int n = grid[0].size();
        queue<vector<int>> q;
        vector<vector<int>> visited(m,vector<int>(n,false));
        vector<vector<int>> surround_array = {{-1,0}, {0, 1}, {1,0}, {0,-1}};
        
        int cntFresh = 0;
        for(int i = 0; i < m; i++){
            for(int j = 0; j < n; j++){
                if(grid[i][j] == 1) cntFresh++;

                if(grid[i][j] == 2){
                    visited[i][j] = true;
                    q.push({i,j,0});
                }
            }
        }

        int rotten_new = 0;
        int tm = 0;
        int max_time = 0;
        while(!q.empty()){
            vector<int> curr = q.front();
            q.pop();
            tm = max(tm, curr[2]);
            for(vector<int> surround : surround_array){
                int x = curr[0] + surround[0];
                int y = curr[1] + surround[1];
                int time_stamp = curr[2] + 1;
                if(x >=0 && x < m && y >= 0 && y < n){
                    if(grid[x][y] == 1 && visited[x][y] == false){
                        visited[x][y] = true;
                        rotten_new++;
                        q.push({x,y, time_stamp});
                    }
                }
            }
        }

        if(cntFresh != rotten_new){
            return -1;
        }

        return tm;


    }
};
```
### 7. [Cycle detection in undirected graph](https://www.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1)

Given an undirected graph as an adjacency list, determine whether it contains a cycle.

**Intuition**: BFS/DFS while tracking the parent of each node; if a visited neighbor is found that is not the immediate parent, a cycle exists.

```cpp
class Solution {
public:
    bool bfsCheck(int start, vector<vector<int>>& adj, vector<bool>& visited) {
        visited[start] = true;
        queue<pair<int,int>> q; // {node, parent}
        q.push({start, -1});

        while(!q.empty()) {
            auto [node, parent] = q.front();
            q.pop();

            for(int neighbor : adj[node]) {
                if(!visited[neighbor]) {
                    visited[neighbor] = true;
                    q.push({neighbor, node});
                }
                else if(neighbor != parent) {
                    return true;
                }
            }
        }

        return false;
    }

    bool isCycle(int V, vector<vector<int>>& adj) {
        vector<bool> visited(V, false);

        for(int i = 0; i < V; i++) {
            if(!visited[i]) {
                if(bfsCheck(i, adj, visited)) return true;
            }
        }

        return false;
    }
};
```

### 8. [Cycle detection in directed graph](https://www.geeksforgeeks.org/problems/detect-cycle-in-a-directed-graph/1)

Given a directed graph as an adjacency list, determine whether it contains a cycle.

**Intuition**: DFS while tracking both a global `visited` set and the current recursion path (`inStack`); a back-edge into a node still on the current path means a cycle.

```cpp
class Solution {
public:
    bool dfs(int node, vector<vector<int>>& adj, vector<bool>& visited, vector<bool>& inStack) {
        visited[node] = true;
        inStack[node] = true;

        for(int neighbor : adj[node]) {
            if(!visited[neighbor]) {
                if(dfs(neighbor, adj, visited, inStack)) return true;
            }
            else if(inStack[neighbor]) {
                return true;
            }
        }

        inStack[node] = false; // backtrack
        return false;
    }

    bool isCyclic(int V, vector<vector<int>>& adj) {
        vector<bool> visited(V, false), inStack(V, false);

        for(int i = 0; i < V; i++) {
            if(!visited[i]) {
                if(dfs(i, adj, visited, inStack)) return true;
            }
        }

        return false;
    }
};
```

### 9. [Topological sort](https://www.geeksforgeeks.org/problems/topological-sort/1)

Given a Directed Acyclic Graph (DAG) as an adjacency list, return a valid topological ordering of its vertices (an ordering where every edge `u -> v` has `u` appearing before `v`).

**Kahn's algorithm (BFS using in-degrees)**:

```cpp
class Solution {
public:
    vector<int> topoSort(int V, vector<vector<int>>& adj) {
        vector<int> indegree(V, 0);

        for(int u = 0; u < V; u++) {
            for(int v : adj[u]) {
                indegree[v]++;
            }
        }

        queue<int> q;
        for(int i = 0; i < V; i++) {
            if(indegree[i] == 0) q.push(i);
        }

        vector<int> ans;

        while(!q.empty()) {
            int node = q.front();
            q.pop();
            ans.push_back(node);

            for(int neighbor : adj[node]) {
                if(--indegree[neighbor] == 0) {
                    q.push(neighbor);
                }
            }
        }

        return ans;
    }
};
```

### 10. [Bipartite Graph/ Graph Coloring](https://leetcode.com/problems/is-graph-bipartite/)

Given an undirected graph as an adjacency list, determine whether it is **bipartite**: its vertices can be split into two sets such that every edge connects a vertex from one set to the other.

**Intuition**: try to 2-color the graph via BFS; if two adjacent nodes ever need the same color, it's not bipartite.

```cpp
class Solution {
public:
    bool isBipartite(vector<vector<int>>& graph) {
        int n = graph.size();
        vector<int> color(n, -1);

        for(int i = 0; i < n; i++) {
            if(color[i] != -1) continue;

            queue<int> q;
            q.push(i);
            color[i] = 0;

            while(!q.empty()) {
                int node = q.front();
                q.pop();

                for(int neighbor : graph[node]) {
                    if(color[neighbor] == -1) {
                        color[neighbor] = 1 - color[node];
                        q.push(neighbor);
                    }
                    else if(color[neighbor] == color[node]) {
                        return false;
                    }
                }
            }
        }

        return true;
    }
};
```

### 11. [Surrounded Regoins](https://leetcode.com/problems/surrounded-regions/)

Given an `m x n` board containing `'X'` and `'O'`, capture all regions of `'O'`s that are completely surrounded by `'X'` (flip them to `'X'`). Regions of `'O'` connected to the border should not be captured.

**Intuition**: any `'O'` connected to the border can never be surrounded, so mark those first (and everything reachable from them), then flip every remaining unmarked `'O'`.

```cpp
class Solution {
public:
    void dfs(int i, int j, vector<vector<char>>& board, vector<vector<bool>>& safe) {
        int m = board.size(), n = board[0].size();

        if(i < 0 || i >= m || j < 0 || j >= n) return;
        if(board[i][j] != 'O' || safe[i][j]) return;

        safe[i][j] = true;

        dfs(i + 1, j, board, safe);
        dfs(i - 1, j, board, safe);
        dfs(i, j + 1, board, safe);
        dfs(i, j - 1, board, safe);
    }

    void solve(vector<vector<char>>& board) {
        int m = board.size(), n = board[0].size();
        vector<vector<bool>> safe(m, vector<bool>(n, false));

        // mark border-connected O's as safe
        for(int i = 0; i < m; i++) {
            dfs(i, 0, board, safe);
            dfs(i, n - 1, board, safe);
        }
        for(int j = 0; j < n; j++) {
            dfs(0, j, board, safe);
            dfs(m - 1, j, board, safe);
        }

        for(int i = 0; i < m; i++) {
            for(int j = 0; j < n; j++) {
                if(board[i][j] == 'O' && !safe[i][j]) {
                    board[i][j] = 'X';
                }
            }
        }
    }
};
```

### 12. [Shortest Path in Non-Weighted Graph](https://www.geeksforgeeks.org/problems/shortest-path-in-undirected-graph-having-unit-distance/1)

Given an undirected graph with `V` vertices numbered from 0 to V-1 and `E` edges, where `edges[i] = [u, v]` denotes an undirected edge between vertex u and vertex v, given two vertices `src` and `dest`, find the length of the shortest path from src to dest. If there is no path between `src` and `dest`, return `-1`.

Note: All edges have a unit weight of 1.

```cpp

class Solution {
	public:
	int shortestPath(int V, vector<vector<int>> &edges, int src, int dest) {
		// Convert edge list to adjacency list
         vector<vector<int>> adj(V);

         for(auto edge : edges) {
             int u = edge[0];
             int v = edge[1];

             adj[u].push_back(v);
             adj[v].push_back(u);
         }

         // BFS
         vector<bool> visited(V, false);
         queue<pair<int, int>> q;

         visited[src] = true;
         q.push({src, 0});

         while(!q.empty()) {

             auto [node, distance] = q.front();
             q.pop();

             if(node == dest)
                 return distance;

             for(int neighbor : adj[node]) {

                 if(!visited[neighbor]) {
                     visited[neighbor] = true;
                     q.push({neighbor, distance + 1});
                 }
             }
         }

         return -1;
     
		
	}
};

```



### 13. [Dijkstra's Algorithm](https://www.geeksforgeeks.org/problems/implementing-dijkstra-set-1-adjacency-matrix/1)

Given a weighted, undirected, connected graph as an `n x n` adjacency matrix (`0` meaning no direct edge) and a source vertex, find the shortest distance from the source to every other vertex.

**Classic O(V²) matrix version** (no priority queue — pick the closest unvisited vertex each round):

```cpp
class Solution {
public:
    vector<int> dijkstra(vector<vector<int>>& graph, int src) {
        int V = graph.size();
        vector<int> dist(V, INT_MAX);
        vector<bool> visited(V, false);

        dist[src] = 0;

        for(int count = 0; count < V - 1; count++) {

            // pick the unvisited vertex with the smallest distance
            int u = -1;
            for(int v = 0; v < V; v++) {
                if(!visited[v] && (u == -1 || dist[v] < dist[u])) {
                    u = v;
                }
            }

            if(dist[u] == INT_MAX) break; // remaining vertices unreachable

            visited[u] = true;

            for(int v = 0; v < V; v++) {
                if(graph[u][v] != 0 && !visited[v] && dist[u] + graph[u][v] < dist[v]) {
                    dist[v] = dist[u] + graph[u][v];
                }
            }
        }

        return dist;
    }
};
```

### 14. [Network Delay](https://leetcode.com/problems/network-delay-time/)

There are `n` network nodes labeled `1` to `n`. You are given `times[i] = [ui, vi, wi]`, meaning a directed edge from `ui` to `vi` with travel time `wi`. Starting a signal from node `k`, return the time it takes for the signal to reach all `n` nodes, or `-1` if it's impossible.

**Intuition**: this is Dijkstra's algorithm — the answer is the maximum shortest-distance among all nodes.

```cpp
class Solution {
public:
    int networkDelayTime(vector<vector<int>>& times, int n, int k) {
        vector<vector<pair<int,int>>> adj(n + 1); // {neighbor, weight}

        for(auto& t : times) {
            adj[t[0]].push_back({t[1], t[2]});
        }

        vector<int> dist(n + 1, INT_MAX);
        dist[k] = 0;

        priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq; // {dist, node}
        pq.push({0, k});

        while(!pq.empty()) {
            auto [d, node] = pq.top();
            pq.pop();

            if(d > dist[node]) continue;

            for(auto [neighbor, weight] : adj[node]) {
                if(d + weight < dist[neighbor]) {
                    dist[neighbor] = d + weight;
                    pq.push({dist[neighbor], neighbor});
                }
            }
        }

        int maxDist = 0;
        for(int i = 1; i <= n; i++) {
            if(dist[i] == INT_MAX) return -1;
            maxDist = max(maxDist, dist[i]);
        }

        return maxDist;
    }
};
```

### 15. [Path With Minimum Effort](https://leetcode.com/problems/path-with-minimum-effort/)

Given a `heights` grid, find a path from the top-left cell to the bottom-right cell (moving in 4 directions) that minimizes the **maximum absolute difference in heights** between two consecutive cells on the path. Return that minimum possible effort.

**Intuition**: a modified Dijkstra where the "distance" to relax is the max effort along the path so far, not a sum.

```cpp
class Solution {
public:
    int minimumEffortPath(vector<vector<int>>& heights) {
        int m = heights.size(), n = heights[0].size();
        vector<vector<int>> effort(m, vector<int>(n, INT_MAX));
        vector<vector<int>> dirs = {{-1,0},{1,0},{0,-1},{0,1}};

        priority_queue<vector<int>, vector<vector<int>>, greater<>> pq; // {effort, x, y}
        pq.push({0, 0, 0});
        effort[0][0] = 0;

        while(!pq.empty()) {
            auto top = pq.top();
            pq.pop();
            int e = top[0], x = top[1], y = top[2];

            if(x == m - 1 && y == n - 1) return e;

            if(e > effort[x][y]) continue;

            for(auto& d : dirs) {
                int nx = x + d[0], ny = y + d[1];
                if(nx < 0 || nx >= m || ny < 0 || ny >= n) continue;

                int newEffort = max(e, abs(heights[nx][ny] - heights[x][y]));

                if(newEffort < effort[nx][ny]) {
                    effort[nx][ny] = newEffort;
                    pq.push({newEffort, nx, ny});
                }
            }
        }

        return 0;
    }
};
```

### 16. [Swim in Rising Water](https://leetcode.com/problems/swim-in-rising-water/)

Given an `n x n` grid where `grid[i][j]` is the elevation at that cell, at time `t` you may move to a cell only if its elevation is `<= t`. Starting at the top-left at time `0`, return the minimum time until you can reach the bottom-right.

**Intuition**: same shape as Path With Minimum Effort — minimize the maximum elevation encountered along the path, via Dijkstra.

```cpp
class Solution {
public:
    int swimInWater(vector<vector<int>>& grid) {
        int n = grid.size();
        vector<vector<int>> best(n, vector<int>(n, INT_MAX));
        vector<vector<int>> dirs = {{-1,0},{1,0},{0,-1},{0,1}};

        priority_queue<vector<int>, vector<vector<int>>, greater<>> pq; // {maxElevation, x, y}
        pq.push({grid[0][0], 0, 0});
        best[0][0] = grid[0][0];

        while(!pq.empty()) {
            auto top = pq.top();
            pq.pop();
            int t = top[0], x = top[1], y = top[2];

            if(x == n - 1 && y == n - 1) return t;

            if(t > best[x][y]) continue;

            for(auto& d : dirs) {
                int nx = x + d[0], ny = y + d[1];
                if(nx < 0 || nx >= n || ny < 0 || ny >= n) continue;

                int newTime = max(t, grid[nx][ny]);

                if(newTime < best[nx][ny]) {
                    best[nx][ny] = newTime;
                    pq.push({newTime, nx, ny});
                }
            }
        }

        return -1;
    }
};
```

### 17. [Bellman ford](https://www.geeksforgeeks.org/problems/distance-from-the-source-bellman-ford-algorithm/1)

Given a weighted directed graph (edges may have negative weights) with `V` vertices and a source vertex, find the shortest distance from the source to every vertex. If a negative-weight cycle makes some distance undefined, report that.

**Intuition**: relax every edge `V-1` times; a distance that can still improve on one more pass indicates a negative cycle.

```cpp
class Solution {
public:
    vector<int> bellmanFord(int V, vector<vector<int>>& edges, int src) {
        vector<long long> dist(V, LLONG_MAX);
        dist[src] = 0;

        for(int i = 0; i < V - 1; i++) {
            for(auto& e : edges) {
                int u = e[0], v = e[1], w = e[2];
                if(dist[u] != LLONG_MAX && dist[u] + w < dist[v]) {
                    dist[v] = dist[u] + w;
                }
            }
        }

        // one more pass to detect a negative cycle
        for(auto& e : edges) {
            int u = e[0], v = e[1], w = e[2];
            if(dist[u] != LLONG_MAX && dist[u] + w < dist[v]) {
                return {-1}; // negative cycle detected
            }
        }

        return vector<int>(dist.begin(), dist.end());
    }
};
```

### 18. [Cheapest Path in K stops](https://leetcode.com/problems/cheapest-flights-within-k-stops/description/)

There are `n` cities connected by flights `[from, to, price]`. Given a source, a destination, and `k` (the maximum number of stops allowed), find the cheapest price to travel from source to destination within `k` stops, or `-1` if not possible.

**Intuition**: Bellman-Ford limited to `k+1` relaxation rounds (one round per allowed edge in the path), using a snapshot of distances from the previous round so updates within the same round don't chain together.

```cpp
class Solution {
public:
    int findCheapestPrice(int n, vector<vector<int>>& flights, int src, int dst, int k) {
        vector<int> dist(n, INT_MAX);
        dist[src] = 0;

        for(int i = 0; i <= k; i++) {
            vector<int> temp = dist; // snapshot so updates don't cascade within a round

            for(auto& f : flights) {
                int u = f[0], v = f[1], w = f[2];
                if(dist[u] != INT_MAX && dist[u] + w < temp[v]) {
                    temp[v] = dist[u] + w;
                }
            }

            dist = temp;
        }

        return dist[dst] == INT_MAX ? -1 : dist[dst];
    }
};
```

### 19. [Prim MST](https://www.geeksforgeeks.org/problems/minimum-spanning-tree/1)

Given a weighted, undirected, connected graph as an adjacency list, find the sum of edge weights of its Minimum Spanning Tree.

**Intuition**: grow the tree one vertex at a time, always adding the cheapest edge that connects a new vertex to the tree so far.

```cpp
class Solution {
public:
    int spanningTree(int V, vector<vector<int>> adj[]) {
        vector<bool> inMST(V, false);
        priority_queue<pair<int,int>, vector<pair<int,int>>, greater<>> pq; // {weight, node}

        pq.push({0, 0});
        int totalWeight = 0;

        while(!pq.empty()) {
            auto [wt, node] = pq.top();
            pq.pop();

            if(inMST[node]) continue;

            inMST[node] = true;
            totalWeight += wt;

            for(auto& edge : adj[node]) {
                int neighbor = edge[0];
                int weight = edge[1];

                if(!inMST[neighbor]) {
                    pq.push({weight, neighbor});
                }
            }
        }

        return totalWeight;
    }
};
```

### 20. [Word Ladder](https://leetcode.com/problems/word-ladder/)
A **transformation sequence** from word `beginWord` to word `endWord` using a dictionary `wordList` is a sequence of words `beginWord -> s1 -> s2 -> ... -> sk` such that:

- Every adjacent pair of words differs by a single letter.
- Every `si` for `1 <= i <= k` is in `wordList`. Note that `beginWord` does not need to be in `wordList`.
- `sk == endWord`

Given two words, `beginWord` and `endWord`, and a dictionary `wordList`, return the ***number of words*** in the ***shortest transformation sequence*** from `beginWord` to `endWord`, or `0` if *no such sequence exists*.

```cpp
class Solution {
public:
    int ladderLength(string beginWord, string endWord, vector<string>& wordList) {
        unordered_map<string,int> mp;
        mp[beginWord] = 1;
        for(int i = 0; i < wordList.size(); i++){
            mp[wordList[i]] = 1;
        }
        if(mp[endWord] != 1) return 0;


        queue<pair<string,int>> q;
        
        mp[beginWord] = 0;
        q.push({beginWord, 1});

        // change each of the letter
        // check if they exist in the set
        // add them to queue

        while(!q.empty()){
            string word = q.front().first;
            int step = q.front().second;

            q.pop();

            if(word == endWord) return step;

            for(int i = 0 ; i < word.size(); i++){
                char original = word[i];
                for(char ch = 'a'; ch <= 'z'; ch++){
                    word[i] = ch;
                    if(mp.find(word) != mp.end()){
                        if(mp[word] == 1){
                            mp[word] = 0;
                            q.push({word, step + 1});
                        }
                    }
                }
                word[i] = original;
            }
        }

        return 0;
    }
};  
```
