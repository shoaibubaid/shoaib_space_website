---
title: Problem Patterns - 13. Tree Pattern
era: Pattern type 13 
readTime: 10 min read
excerpt: 
floats: bulb.png, cpu.png, gpu.png, keyboard.png, monitor.png, ram.png, star_yellow.png
background: cs/dsa.png
---
# 13. Tree
Tree Data Structure is a non-linear data structure in which a collection of elements known as nodes are connected to each other via edges such that there exists exactly one path between any two nodes.

[Tree Data Structure](https://www.geeksforgeeks.org/dsa/tree-data-structure/)

Standard node definition used throughout (as provided by LeetCode):

```cpp
struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};
```

## 1. Traversal
### 1. [Inorder](https://leetcode.com/problems/binary-tree-inorder-traversal/description/)

Given the `root` of a binary tree, return the **inorder traversal** (left, root, right) of its nodes' values.
```cpp
/**
 * Definition for a binary tree node.
 * struct TreeNode {
 *     int val;
 *     TreeNode *left;
 *     TreeNode *right;
 *     TreeNode() : val(0), left(nullptr), right(nullptr) {}
 *     TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
 *     TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
 * };
 */
class Solution {
public:
    void inorder(TreeNode* root, vector<int> &ans){
        if(root == nullptr) return;
        inorder(root->left, ans);
        ans.push_back(root->val);
        inorder(root->right, ans);
    }

    vector<int> inorderTraversal(TreeNode* root) {
        vector<int> ans;
        inorder(root, ans);
        return ans;
    }
};
```
```cpp
class Solution {
public:
    vector<int> inorderTraversal(TreeNode* root) {
        vector<int> ans;
        stack<TreeNode*> st;
        TreeNode* curr = root;

        while(curr != nullptr || !st.empty()) {
            while(curr != nullptr) {
                st.push(curr);
                curr = curr->left;
            }

            curr = st.top();
            st.pop();
            ans.push_back(curr->val);
            curr = curr->right;
        }

        return ans;
    }
};
```

### 2. [Preorder](https://leetcode.com/problems/binary-tree-preorder-traversal/description/)

Given the `root` of a binary tree, return the **preorder traversal** (root, left, right) of its nodes' values.

```cpp
class Solution {
public:
    vector<int> preorderTraversal(TreeNode* root) {
        vector<int> ans;
        if(root == nullptr) return ans;

        stack<TreeNode*> st;
        st.push(root);

        while(!st.empty()) {
            TreeNode* curr = st.top();
            st.pop();

            ans.push_back(curr->val);

            // push right first so left is processed first
            if(curr->right) st.push(curr->right);
            if(curr->left) st.push(curr->left);
        }

        return ans;
    }
};
```

### 3. [Postorder](https://leetcode.com/problems/binary-tree-postorder-traversal/description/)

Given the `root` of a binary tree, return the **postorder traversal** (left, right, root) of its nodes' values.

```cpp
class Solution {
public:
    vector<int> postorderTraversal(TreeNode* root) {
        vector<int> ans;
        if(root == nullptr) return ans;

        stack<TreeNode*> st;
        st.push(root);

        while(!st.empty()) {
            TreeNode* curr = st.top();
            st.pop();

            // root, right, left -> reverse at the end gives left, right, root
            ans.push_back(curr->val);

            if(curr->left) st.push(curr->left);
            if(curr->right) st.push(curr->right);
        }

        reverse(ans.begin(), ans.end());
        return ans;
    }
};
```

### 4. [Level Order](https://leetcode.com/problems/binary-tree-level-order-traversal/description/)

Given the `root` of a binary tree, return the **level order traversal** of its nodes' values (i.e., from left to right, level by level).

```cpp
class Solution {
public:
    vector<vector<int>> levelOrder(TreeNode* root) {
        vector<vector<int>> ans;
        if(root == nullptr) return ans;

        queue<TreeNode*> q;
        q.push(root);

        while(!q.empty()) {
            int size = q.size();
            vector<int> level;

            for(int i = 0; i < size; i++) {
                TreeNode* curr = q.front();
                q.pop();

                level.push_back(curr->val);

                if(curr->left) q.push(curr->left);
                if(curr->right) q.push(curr->right);
            }

            ans.push_back(level);
        }

        return ans;
    }
};
```

### 5. [ZigZag Order](https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/description/)

Given the `root` of a binary tree, return the **zigzag level order traversal**: left to right, then right to left for the next level, alternating.

```cpp
class Solution {
public:
    vector<vector<int>> zigzagLevelOrder(TreeNode* root) {
        vector<vector<int>> ans;
        if(root == nullptr) return ans;

        queue<TreeNode*> q;
        q.push(root);
        bool leftToRight = true;

        while(!q.empty()) {
            int size = q.size();
            vector<int> level(size);

            for(int i = 0; i < size; i++) {
                TreeNode* curr = q.front();
                q.pop();

                // place directly at the correct index instead of reversing later
                int idx = leftToRight ? i : (size - 1 - i);
                level[idx] = curr->val;

                if(curr->left) q.push(curr->left);
                if(curr->right) q.push(curr->right);
            }

            ans.push_back(level);
            leftToRight = !leftToRight;
        }

        return ans;
    }
};
```

### 6. [Level Order II](https://leetcode.com/problems/binary-tree-level-order-traversal-ii/description/)

Given the `root` of a binary tree, return the **bottom-up level order traversal** of its nodes' values (from leaf-level to root-level).

```cpp
class Solution {
public:
    vector<vector<int>> levelOrderBottom(TreeNode* root) {
        vector<vector<int>> ans;
        if(root == nullptr) return ans;

        queue<TreeNode*> q;
        q.push(root);

        while(!q.empty()) {
            int size = q.size();
            vector<int> level;

            for(int i = 0; i < size; i++) {
                TreeNode* curr = q.front();
                q.pop();

                level.push_back(curr->val);

                if(curr->left) q.push(curr->left);
                if(curr->right) q.push(curr->right);
            }

            ans.push_back(level);
        }

        reverse(ans.begin(), ans.end());
        return ans;
    }
};
```

## 2. Mirror and Symmetry
### 1. [Invert Tree](https://leetcode.com/problems/invert-binary-tree/description/)

Given the `root` of a binary tree, invert the tree (swap every left and right child), and return its root.

```cpp
class Solution {
public:
    TreeNode* invertTree(TreeNode* root) {
        if(root == nullptr) return nullptr;

        swap(root->left, root->right);

        invertTree(root->left);
        invertTree(root->right);

        return root;
    }
};
```

### 2. [Symmetric Tree](https://leetcode.com/problems/symmetric-tree/description/)

Given the `root` of a binary tree, check whether it is a mirror of itself (symmetric around its center).

```cpp
class Solution {
public:
    bool isMirror(TreeNode* left, TreeNode* right) {
        if(left == nullptr && right == nullptr) return true;
        if(left == nullptr || right == nullptr) return false;

        return left->val == right->val
            && isMirror(left->left, right->right)
            && isMirror(left->right, right->left);
    }

    bool isSymmetric(TreeNode* root) {
        if(root == nullptr) return true;
        return isMirror(root->left, root->right);
    }
};
```

### 3. [Same Tree](https://leetcode.com/problems/same-tree/description/)

Given the roots of two binary trees `p` and `q`, check if they are the same tree (structurally identical and nodes have the same value).

```cpp
class Solution {
public:
    bool isSameTree(TreeNode* p, TreeNode* q) {
        if(p == nullptr && q == nullptr) return true;
        if(p == nullptr || q == nullptr) return false;

        return p->val == q->val
            && isSameTree(p->left, q->left)
            && isSameTree(p->right, q->right);
    }
};
```

### 4. [Subtree of another TREE](https://leetcode.com/problems/subtree-of-another-tree/description/)

Given the roots of two binary trees `root` and `subRoot`, check whether `subRoot` (with matching descendant structure and node values) is a subtree of `root`.

```cpp
class Solution {
public:
    bool isSameTree(TreeNode* a, TreeNode* b) {
        if(a == nullptr && b == nullptr) return true;
        if(a == nullptr || b == nullptr) return false;

        return a->val == b->val
            && isSameTree(a->left, b->left)
            && isSameTree(a->right, b->right);
    }

    bool isSubtree(TreeNode* root, TreeNode* subRoot) {
        if(root == nullptr) return false;

        if(isSameTree(root, subRoot)) return true;

        // try matching starting from every node
        return isSubtree(root->left, subRoot) || isSubtree(root->right, subRoot);
    }
};
```

### 5. [Flip Equivalent Tree](https://leetcode.com/problems/flip-equivalent-binary-trees/description/)

Given the roots of two binary trees, check if they are **flip equivalent**: one can be obtained from the other by swapping left/right children of some (possibly zero) nodes.

```cpp
class Solution {
public:
    bool flipEquiv(TreeNode* root1, TreeNode* root2) {
        if(root1 == nullptr && root2 == nullptr) return true;
        if(root1 == nullptr || root2 == nullptr) return false;
        if(root1->val != root2->val) return false;

        // either children match as-is, or they match after a flip
        bool noFlip = flipEquiv(root1->left, root2->left)
                    && flipEquiv(root1->right, root2->right);

        bool flipped = flipEquiv(root1->left, root2->right)
                     && flipEquiv(root1->right, root2->left);

        return noFlip || flipped;
    }
};
```

## 3. Search
### 1. [Lowest Common Ancestor of Binary Tree](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/description/)

Given a binary tree and two nodes `p` and `q`, find their **lowest common ancestor (LCA)**: the deepest node that has both `p` and `q` as descendants.

```cpp
class Solution {
public:
    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
        if(root == nullptr || root == p || root == q) return root;

        TreeNode* left = lowestCommonAncestor(root->left, p, q);
        TreeNode* right = lowestCommonAncestor(root->right, p, q);

        // p and q found in different subtrees -> current node is the LCA
        if(left && right) return root;

        return left ? left : right;
    }
};
```

### 2. [Binary Search Tree](https://leetcode.com/problems/search-in-a-binary-search-tree/)

Given the `root` of a BST and an integer `val`, find the node in the BST whose value equals `val` and return the subtree rooted there, or `nullptr` if not found.

```cpp
class Solution {
public:
    TreeNode* searchBST(TreeNode* root, int val) {
        while(root != nullptr && root->val != val) {
            root = (val < root->val) ? root->left : root->right;
        }

        return root;
    }
};
```

### 3. [Lowest Common Ancestor of Binary Search Tree](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/description/)

Given a BST and two nodes `p` and `q`, find their lowest common ancestor. BST ordering lets us decide direction without exploring both subtrees.

```cpp
class Solution {
public:
    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
        while(root != nullptr) {
            if(p->val < root->val && q->val < root->val) {
                root = root->left;
            }
            else if(p->val > root->val && q->val > root->val) {
                root = root->right;
            }
            else {
                // split point: one is <= root, other is >= root
                return root;
            }
        }

        return nullptr;
    }
};
```

### 4. [Lowest Common Ancestor of Deepest Leaves](https://leetcode.com/problems/lowest-common-ancestor-of-deepest-leaves/description/)

Given the `root` of a binary tree, return the LCA of its deepest leaves (the smallest subtree that contains all nodes at the maximum depth).

**Intuition**: recurse to get `{node, depth}` for each subtree; if both children have equal depth, the current node is the answer for that depth; otherwise propagate the deeper side's answer up.

```cpp
class Solution {
public:
    pair<TreeNode*, int> solve(TreeNode* node) {
        if(node == nullptr) return {nullptr, 0};

        auto left = solve(node->left);
        auto right = solve(node->right);

        if(left.second == right.second) {
            return {node, left.second + 1};
        }
        else if(left.second > right.second) {
            return {left.first, left.second + 1};
        }
        else {
            return {right.first, right.second + 1};
        }
    }

    TreeNode* lcaDeepestLeaves(TreeNode* root) {
        return solve(root).first;
    }
};
```

### 5. [Two Sum IV](https://leetcode.com/problems/two-sum-iv-input-is-a-bst/description/)

Given the `root` of a BST and an integer `k`, return `true` if there exist two elements in the BST such that their sum equals `k`.

```cpp
class Solution {
public:
    unordered_set<int> seen;

    bool findTarget(TreeNode* root, int k) {
        if(root == nullptr) return false;

        if(seen.count(k - root->val)) return true;

        seen.insert(root->val);

        return findTarget(root->left, k) || findTarget(root->right, k);
    }
};
```

### 6. [Kth smallest element in BST](https://leetcode.com/problems/kth-smallest-element-in-a-bst/description/)

Given the `root` of a BST and an integer `k`, return the `k`th smallest value among all node values.

**Intuition**: an inorder traversal of a BST visits nodes in sorted order, so stop at the kth visit.

```cpp
class Solution {
public:
    int kthSmallest(TreeNode* root, int k) {
        stack<TreeNode*> st;
        TreeNode* curr = root;

        while(curr != nullptr || !st.empty()) {
            while(curr != nullptr) {
                st.push(curr);
                curr = curr->left;
            }

            curr = st.top();
            st.pop();

            if(--k == 0) return curr->val;

            curr = curr->right;
        }

        return -1;
    }
};
```

## 4. Validation
### 1. [Minimum Depth of Binary Tree](https://leetcode.com/problems/minimum-depth-of-binary-tree/description/)

Given a binary tree, find its minimum depth: the number of nodes along the shortest path from root to the nearest leaf.

```cpp
class Solution {
public:
    int minDepth(TreeNode* root) {
        if(root == nullptr) return 0;

        // a node with only one child is not a leaf,
        // so we must go down the existing side
        if(root->left == nullptr) return 1 + minDepth(root->right);
        if(root->right == nullptr) return 1 + minDepth(root->left);

        return 1 + min(minDepth(root->left), minDepth(root->right));
    }
};
```

### 2. [Maximum Depth of Binary Tree](https://leetcode.com/problems/maximum-depth-of-binary-tree/description/)

Given a binary tree, find its maximum depth: the number of nodes along the longest path from root to the farthest leaf.

```cpp
class Solution {
public:
    int maxDepth(TreeNode* root) {
        if(root == nullptr) return 0;

        return 1 + max(maxDepth(root->left), maxDepth(root->right));
    }
};
```

### 3. [Balanced Binary Tree](https://leetcode.com/problems/balanced-binary-tree/description/)

Given a binary tree, determine if it is height-balanced (the depths of the two subtrees of every node never differ by more than one).

**Intuition**: compute height bottom-up and short-circuit with `-1` as soon as an imbalance is found, avoiding recomputation.

```cpp
class Solution {
public:
    int height(TreeNode* node) {
        if(node == nullptr) return 0;

        int left = height(node->left);
        if(left == -1) return -1;

        int right = height(node->right);
        if(right == -1) return -1;

        if(abs(left - right) > 1) return -1;

        return 1 + max(left, right);
    }

    bool isBalanced(TreeNode* root) {
        return height(root) != -1;
    }
};
```

### 4. [Diameter of Binary Tree](https://leetcode.com/problems/diameter-of-binary-tree/description/)

Given a binary tree, return the length of the diameter: the length (in edges) of the longest path between any two nodes, which may or may not pass through the root.

```cpp
class Solution {
public:
    int diameter = 0;

    int height(TreeNode* node) {
        if(node == nullptr) return 0;

        int left = height(node->left);
        int right = height(node->right);

        // best path through this node
        diameter = max(diameter, left + right);

        return 1 + max(left, right);
    }

    int diameterOfBinaryTree(TreeNode* root) {
        height(root);
        return diameter;
    }
};
```

### 5. [Check Completeness of Binary Tree](https://leetcode.com/problems/check-completeness-of-a-binary-tree/description/)

Given the `root` of a binary tree, determine if it is a **complete binary tree** (every level except possibly the last is fully filled, and all nodes in the last level are as far left as possible).

**Intuition**: BFS including `nullptr` children; once a `nullptr` is seen, no real node should appear after it.

```cpp
class Solution {
public:
    bool isCompleteTree(TreeNode* root) {
        queue<TreeNode*> q;
        q.push(root);
        bool seenNull = false;

        while(!q.empty()) {
            TreeNode* curr = q.front();
            q.pop();

            if(curr == nullptr) {
                seenNull = true;
                continue;
            }

            if(seenNull) return false;

            q.push(curr->left);
            q.push(curr->right);
        }

        return true;
    }
};
```

### 6. [Validate BST](https://leetcode.com/problems/validate-binary-search-tree/description/)

Given the `root` of a binary tree, determine if it is a valid BST (left subtree values < node < right subtree values, recursively).

```cpp
class Solution {
public:
    bool solve(TreeNode* node, long long lower, long long upper) {
        if(node == nullptr) return true;

        if(node->val <= lower || node->val >= upper) return false;

        return solve(node->left, lower, node->val)
            && solve(node->right, node->val, upper);
    }

    bool isValidBST(TreeNode* root) {
        return solve(root, LLONG_MIN, LLONG_MAX);
    }
};
```

### 7. [Recover BST](https://leetcode.com/problems/recover-binary-search-tree/description/)

Two nodes of a BST have had their values swapped by mistake. Recover the tree without changing its structure.

**Intuition**: an inorder traversal of a correct BST is strictly increasing. Track the previous node; when a decrease is found, mark it. The first decrease flags the first wrong node, and the following decrease (or the same one on the very next comparison) flags the second.

```cpp
class Solution {
public:
    TreeNode *first = nullptr, *second = nullptr, *prev = nullptr;

    void inorder(TreeNode* node) {
        if(node == nullptr) return;

        inorder(node->left);

        if(prev != nullptr && prev->val > node->val) {
            if(first == nullptr) first = prev;
            second = node;
        }
        prev = node;

        inorder(node->right);
    }

    void recoverTree(TreeNode* root) {
        inorder(root);
        swap(first->val, second->val);
    }
};
```

## 5. Path SUM
### 1. [Path Sum](https://leetcode.com/problems/path-sum/description/)

Given the `root` of a binary tree and an integer `targetSum`, return `true` if the tree has a root-to-leaf path such that adding up all the values along the path equals `targetSum`.

```cpp
class Solution {
public:
    bool hasPathSum(TreeNode* root, int targetSum) {
        if(root == nullptr) return false;

        if(root->left == nullptr && root->right == nullptr) {
            return targetSum == root->val;
        }

        int remaining = targetSum - root->val;

        return hasPathSum(root->left, remaining) || hasPathSum(root->right, remaining);
    }
};
```

### 2. [Path Sum II](https://leetcode.com/problems/path-sum-ii/)

Given the `root` of a binary tree and an integer `targetSum`, return **all** root-to-leaf paths where each path's sum equals `targetSum`.

```cpp
class Solution {
public:
    vector<vector<int>> ans;
    vector<int> path;

    void solve(TreeNode* node, int remaining) {
        if(node == nullptr) return;

        path.push_back(node->val);
        remaining -= node->val;

        if(node->left == nullptr && node->right == nullptr && remaining == 0) {
            ans.push_back(path);
        }
        else {
            solve(node->left, remaining);
            solve(node->right, remaining);
        }

        path.pop_back(); // backtrack
    }

    vector<vector<int>> pathSum(TreeNode* root, int targetSum) {
        solve(root, targetSum);
        return ans;
    }
};
```

### 3. [Sum of Root to Leaf](https://leetcode.com/problems/sum-root-to-leaf-numbers/description/)

Each root-to-leaf path represents a number formed by concatenating digits along the path. Return the total sum of all root-to-leaf numbers.

```cpp
class Solution {
public:
    int solve(TreeNode* node, int curr) {
        if(node == nullptr) return 0;

        curr = curr * 10 + node->val;

        if(node->left == nullptr && node->right == nullptr) return curr;

        return solve(node->left, curr) + solve(node->right, curr);
    }

    int sumNumbers(TreeNode* root) {
        return solve(root, 0);
    }
};
```

### 4. [Maximum Path Sum](https://leetcode.com/problems/binary-tree-maximum-path-sum/description/)

<font color="red">**HARD**</font>

Given the `root` of a binary tree, return the maximum path sum of any non-empty path (a path may start and end at any node, and does not need to pass through the root).

**Intuition**: for each node, compute the best sum extending downward on one side only (usable by its parent), while separately tracking the best "through this node" sum using both sides.

```cpp
class Solution {
public:
    int best = INT_MIN;

    int solve(TreeNode* node) {
        if(node == nullptr) return 0;

        // ignore negative contributions from either side
        int left = max(0, solve(node->left));
        int right = max(0, solve(node->right));

        // path passing through this node using both sides
        best = max(best, node->val + left + right);

        // only one side can be extended upward to the parent
        return node->val + max(left, right);
    }

    int maxPathSum(TreeNode* root) {
        solve(root);
        return best;
    }
};
```

## 6. Construction
### 1. [Contruct tree from preorder and inorder](https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/description/)

Given two integer arrays `preorder` and `inorder` representing the preorder and inorder traversal of a binary tree, construct and return the tree.

**Intuition**: the first element of `preorder` is always the root. Its position in `inorder` splits the tree into left and right subtrees.

```cpp
class Solution {
public:
    unordered_map<int, int> inorderIndex;
    int preIdx = 0;

    TreeNode* solve(vector<int>& preorder, int inLeft, int inRight) {
        if(inLeft > inRight) return nullptr;

        int rootVal = preorder[preIdx++];
        TreeNode* root = new TreeNode(rootVal);

        int mid = inorderIndex[rootVal];

        // build left first since preIdx is consumed in preorder order
        root->left = solve(preorder, inLeft, mid - 1);
        root->right = solve(preorder, mid + 1, inRight);

        return root;
    }

    TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {
        for(int i = 0; i < inorder.size(); i++) {
            inorderIndex[inorder[i]] = i;
        }

        return solve(preorder, 0, inorder.size() - 1);
    }
};
```

### 2. [Contruct tree from postorder and inorder](https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/description/)

Given two integer arrays `inorder` and `postorder` representing the inorder and postorder traversal of a binary tree, construct and return the tree.

**Intuition**: the last element of `postorder` is always the root. Build the right subtree before the left, since postorder is consumed from the back.

```cpp
class Solution {
public:
    unordered_map<int, int> inorderIndex;
    int postIdx;

    TreeNode* solve(vector<int>& postorder, int inLeft, int inRight) {
        if(inLeft > inRight) return nullptr;

        int rootVal = postorder[postIdx--];
        TreeNode* root = new TreeNode(rootVal);

        int mid = inorderIndex[rootVal];

        // build right first since postIdx is consumed from the end
        root->right = solve(postorder, mid + 1, inRight);
        root->left = solve(postorder, inLeft, mid - 1);

        return root;
    }

    TreeNode* buildTree(vector<int>& inorder, vector<int>& postorder) {
        for(int i = 0; i < inorder.size(); i++) {
            inorderIndex[inorder[i]] = i;
        }

        postIdx = postorder.size() - 1;
        return solve(postorder, 0, inorder.size() - 1);
    }
};
```

### 3. [Sorted Array to BST](https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/description/)

Given an integer array `nums` sorted in ascending order, convert it to a **height-balanced** BST.

**Intuition**: pick the middle element as root so both halves are as equal in size as possible, then recurse.

```cpp
class Solution {
public:
    TreeNode* solve(vector<int>& nums, int left, int right) {
        if(left > right) return nullptr;

        int mid = left + (right - left) / 2;

        TreeNode* root = new TreeNode(nums[mid]);
        root->left = solve(nums, left, mid - 1);
        root->right = solve(nums, mid + 1, right);

        return root;
    }

    TreeNode* sortedArrayToBST(vector<int>& nums) {
        return solve(nums, 0, nums.size() - 1);
    }
};
```
