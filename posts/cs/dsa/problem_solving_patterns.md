---
title: Problem solving patterns
era: commonly occuring DSA patterns
readTime: 10 min read
excerpt: 
floats: bulb.png, cpu.png, gpu.png, keyboard.png, monitor.png, ram.png, star_yellow.png
background: cs/dsa.png
---

Credits : [padho_with_pratyush](https://www.youtube.com/@padho_with_pratyush)

## 1. Two Pointers

[Two pointer approach GFG](https://www.geeksforgeeks.org/dsa/two-pointers-technique/)

Use the two pointer approach when you see any of these:
-  Sorted Input
-  Pairs or Subarrays
-  Sliding Window Problems
-  Linked Lists (Slow–Fast pointers)
-  Elements have opposite destinations
-  You need to examine both ends


Examples
1. [Pair with Target Sum (easy)](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/description/) 

Here we have a Sorted Input and asking for pairs, so we go for two pointer approach.


```cpp
// Brute force method
class Solution {
public:
    vector<int> twoSum(vector<int>& numbers, int target) {
        for(int i = 0; i < numbers.size(); i++){
            for(int j = i+1; j < numbers.size(); j++){
                if(numbers[i]+numbers[j] == target) return {i+1, j+1};
            }
        }
        return {-1, -1};
    }
};

// Optimum 2 Pointer approach
class Solution {
public:
    vector<int> twoSum(vector<int>& numbers, int target) {
        int left = 0;
        int right = numbers.size() - 1;

        while(left <= right){
            if(numbers[left] + numbers[right] == target){
                return {left+1, right+1};
            }

            if(numbers[left] + numbers[right] < target){
                left++;
            }
            else{
                right--;
            }
        }
        return {-1, -1};
    }
};
```

2. [Rearrange 0 and 1](https://www.geeksforgeeks.org/problems/segregate-0s-and-1s5106/1)

Given an array `arr[]` consisting of only `0`'s and `1`'s. Modify the array in-place to segregate 0s onto the left side and 1s onto the right side of the array.


*Here, I did not even thought of doing two pointer approach.*


```cpp
// First approach that I tried.
class Solution {
  public:
    void segregate0and1(vector<int> &arr) {
        // code here
        int count = 0;
        for(int i = 0; i < arr.size(); i++){
            if (arr[i] == 0){
                arr[count++] = 0;
            }
        }
        
        for(int i = count; i < arr.size(); i++){
            arr[i] = 1;
        }
    }
};
```

```cpp
// Optimum 2 pointer approach

class Solution {
  public:
    void segregate0and1(vector<int> &arr) {
        // code here
        int left = 0;
        int right = arr.size() - 1;
        
        while(left < right){
            if(arr[left] == 0){
                left++;
            }
            else if(arr[right] == 1){
                right--;
            }
            else{// that is, arr[left] = 1 and arr[right] = 0
                swap(arr[left++], arr[right--]);
                
            }
        }
    }
};

```
3. [Remove Duplicates (easy)](https://leetcode.com/problems/remove-duplicates-from-sorted-list/)

Given the `head` of a sorted linked list, delete all duplicates such that each element appears only once. Return the linked list sorted as well.

```cpp
// optimum solution
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */
class Solution {
public:
    ListNode* deleteDuplicates(ListNode* head) {
        if(head == NULL || head->next == nullptr){
            return head;
        }
        
        ListNode* left = head;
        ListNode* right = head->next;

        while(right != nullptr){
            if(left->val == right->val){
                left->next = right->next;
                right = right->next;
            }
            else{
                left = left->next;
                right = right->next;
            }
        }
        return head;
    }
};
```

4. [Squaring a Sorted Array (easy)](https://leetcode.com/problems/squares-of-a-sorted-array/)

Given an integer array `nums` sorted in non-decreasing order, return an array of the squares of each number sorted in non-decreasing order.

This uses two pointer merge sort technique inherently

similar: [88. Merge Sorted Array](https://leetcode.com/problems/merge-sorted-array/description/), [360. Sort Transformed Array](https://leetcode.com/problems/sort-transformed-array/description/)

```cpp
class Solution {
public:
    vector<int> sortedSquares(vector<int>& nums) {
        int left =  nums.size() - 1;
        int right = nums.size();
        int current = 0;
        vector<int> ans(
            nums.size()); // can be optimized without using extra space?
        for (int i = 0; i < nums.size(); i++) {
            if (nums[i] >= 0) {
                left = i - 1;
                right = i;
                break;
            }
        }

        while (left > -1 && right < nums.size()) {
            if (nums[left] * nums[left] <= nums[right] * nums[right]) {
                ans[current++] = nums[left] * nums[left];
                left--;
            } else {
                ans[current++] = (nums[right] * nums[right]);
                right++;
            }
        }

        while (left > -1) {
            ans[current++] = (nums[left] * nums[left]);
            left--;
        }
        while (right < nums.size()) {
            ans[current++] = (nums[right] * nums[right]);
            right++;
        }
        return ans;
    }
};
```
5. [Triplet Sum to Zero (medium)](https://leetcode.com/problems/3sum/)

Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.

Notice that the solution set must not contain duplicate triplets.

```cpp
// O(n²) complexity
class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {

        vector<vector<int>> ans;
        // first sort them all
        vector<int> nums2 = nums;
        sort(nums2.begin(), nums2.end());

        // apply two sum for each of the iteration
        for (int i = 0; i < nums2.size() - 2; i++) {
            if (i > 0 && nums2[i] == nums2[i - 1])
                continue; // skip duplicate i
            int left = i + 1;
            int right = nums2.size() - 1;

            int target = -1 * (nums2[i]);
            while (left < right) {
                if (nums2[left] + nums2[right] == target) {
                    ans.push_back({nums2[i], nums2[left], nums2[right]});
                    left++;
                    right--;

                    while (left < right && nums2[left] == nums2[left - 1])
                        left++; // skip duplicate left
                    while (left < right && nums2[right] == nums2[right + 1])
                        right--; // skip duplicate right
                } else if (nums2[left] + nums2[right] < target) {
                    left++;
                } else {
                    right--;
                }
            }
        }
        return ans;
    }
};
```

6. [Triplet Sum Close to Target (medium)](https://leetcode.com/problems/3sum-closest/)

```cpp
class Solution {
public:
    int threeSumClosest(vector<int>& nums, int target) {
        int n = nums.size();
        sort(nums.begin(), nums.end());
        int closest = nums[0] + nums[1] + nums[2];

        for (int i = 0; i < n-2; i++) {
            int left = i + 1;
            int right = n - 1;

            while (left < right) {
                int sum = nums[i] + nums[left] + nums[right]; 
                if(sum == target){
                    return target;
                }
                if (abs(sum - target) < abs(closest - target)) {
                    closest = sum;
                }
                if(sum < target){
                    left++;
                }
                else{
                    right--;
                }
            }
        }
        return closest;
    }
};
```
7. [Triplets with Smaller Sum (medium)](https://www.geeksforgeeks.org/problems/count-triplets-with-sum-smaller-than-x5549/1)

```cpp
class Solution {
  public:
    int countTriplets(int sum, vector<int>& arr) {
        int n = arr.size();
        int count = 0;
        sort(arr.begin(), arr.end());
        for(int i = 0; i < n-2; i++){
            if(i > 0 && arr[i] == arr[i-1]) continue;
            int left = i+1;
            int right = n-1;
            
            while(left < right){
                int current_sum = arr[i] + arr[left] + arr[right];
                if(current_sum < sum) {
                    count+= right-left; // because all other between the left and right satisfies 
                    left++;
                    
                    while(left < right && arr[left] == arr[left-1]) left++;
                }
                else{
                    right--;
                    while(left < right && arr[right] == arr[right+1]) right--;
                }
            }
        }
        return count;
        
    }
};
```
8. [Subarrays with Product Less than a Target (medium)](https://leetcode.com/problems/subarray-product-less-than-k/)

You are given an array of integers `nums` and an integer k.

Return the number of contiguous subarrays where the product of all the elements in the subarray is strictly less than `k`.

*This one requires a bit of thinking. This tells how to count contigous subarrays*

```cpp
class Solution {
public:
    int numSubarrayProductLessThanK(vector<int>& nums, int k) {
        if (k <= 1)
            return 0;

        int left = 0;
        int ans = 0;
        int product = 1;

        for (int right = 0; right < nums.size(); right++) {
            product *= nums[right];

            while (product >= k) {
                product /= nums[left];
                left++;
            }

            ans += right - left + 1;
        }

        return ans;
    }
};
```

9. [Dutch National Flag Problem (medium)](https://leetcode.com/problems/sort-colors/description/)
10. [Problem Challenge 1: Quadruple Sum to Target (medium)](https://leetcode.com/problems/4sum/)
11. [Problem Challenge 2: Comparing Strings containing Backspaces (medium)](https://leetcode.com/problems/backspace-string-compare/)
12. [Problem Challenge 3: Minimum Window Sort (medium)](https://leetcode.com/problems/shortest-unsorted-continuous-subarray/)

## 2. Fast and Slow Pointers
1. [LinkedList Cycle (easy)](https://leetcode.com/problems/linked-list-cycle/)
2. [Start of LinkedList Cycle (medium)](https://leetcode.com/problems/linked-list-cycle-ii/)
3. [Happy Number (medium)](https://leetcode.com/problems/happy-number/)
4. [FIND DUPLICATE NUMBER](https://leetcode.com/problems/find-the-duplicate-number/description/)
5. [Middle of the LinkedList (easy)](https://leetcode.com/problems/middle-of-the-linked-list/)
6. [Problem Challenge 1: Palindrome LinkedList (medium)](https://leetcode.com/problems/palindrome-linked-list/)
7. [Problem Challenge 2: Rearrange a LinkedList (medium)](https://leetcode.com/problems/reorder-list/)
8. [Problem Challenge 3: Cycle in a Circular Array (hard)](https://leetcode.com/problems/circular-array-loop/)

## 3. Sliding Window
1. [Maximum Sum Subarray of Size K (easy)](https://www.geeksforgeeks.org/problems/max-sum-subarray-of-size-k5313/1)
2. [Smallest Subarray with a given sum (easy)](https://leetcode.com/problems/minimum-size-subarray-sum/)
3. [Longest Substring with K Distinct Characters (medium)](https://www.geeksforgeeks.org/problems/)
4. [Fruits into Baskets (medium)](longest-k-unique-characters-substring0853/1)
5. [No-repeat Substring (hard)](https://leetcode.com/problems/fruit-into-baskets/longest-substring-without-repeating-characters/)
6. [Longest Substring with Same Letters after Replacement (hard)](https://leetcode.com/problems/longest-repeating-character-replacement/)
7. [Longest Subarray with Ones after Replacement (hard)](https://leetcode.com/problems/max-consecutive-ones-iii/)
8. [Minimum size subarray SUM](https://leetcode.com/problems/minimum-size-subarray-sum/)
9. [MInimum Size Substring (HARD)](https://leetcode.com/problems/minimum-window-substring/description/?envType=study-plan-v2&envId=top-interview-150)
10. [Problem Challenge 1: Permutation in a String (hard)](https://leetcode.com/problems/permutation-in-string/)
11. [Problem Challenge 2: String Anagrams (hard)](https://leetcode.com/problems/find-all-anagrams-in-a-string/)
12. [Problem Challenge 4: Words Concatenation (hard)](https://leetcode.com/problems/substring-with-concatenation-of-all-words/)

## 4. Kadane Pattern
1. [Maximum subarray sum]()
1. [Minimum Subarray Sum]()
1. [Maximum product subarray]()
1. [Maximum subarray sum with one deletion]()
1. [Maximum absolute sum of any subarray]()
1. [Maximum sum in circular array variant]()
## 5. Prefix Sum
1. [Subarray Sum Equals K (EASY)]()
1. [Find Pivot Index (EASY)]()
1. [Subarray Sums Divisible By K (Med)]()
1. [Contiguous array (MED)]()
1. [Problem challenge: Shortest Subarray With Sum at Least K (HARD)]()
1. [Problem challenge: Count Range Sum (hard)]()
## 6. Merge Intervals
1. [Merge Intervals (medium)]()
1. [Insert Interval (medium)]()
1. [Intervals Intersection (medium)]()
1. [Overlapping Intervals]()
1. [Problem Challenge 1: Minimum Meeting Rooms (hard)]()
1. [Problem Challenge 2: Maximum CPU Load (hard)]()
1. [Problem Challenge 3: Employee Free Time (hard)]()
## 7. LinkedList Reversal (in-place)
1. [Reverse a LinkedList (easy)]()
1. [Reverse a Sub-list (medium)]()
1. [Reverse List in Pairs (Medium)]()
1. [Reverse every K-element Sub-list (HARD)]()
1. [Problem Challenge 1: Reverse nodes in EVEN Length Groups (HARD)]()
1. [Problem Challenge 2: Rotate a LinkedList (medium)]()
## 8. Stack
1. [Remove adjacent duplicates]()
1. [Balanced Parentheses]()
1. [Reverse a String]()
1. [Next Greater Element (easy)]()
1. [Daily Temperatures (easy)]()
1. [Remove Nodes From Linked List (easy)]()
1. [Remove All Adjacent Duplicates in String II (medium)]()
1. [Simplify Path (Problem Challenge)]()
1. [Remove K Digits (hard) Problem challenge]()
## 9. Hash Maps
1. [First Non-repeating Character (easy)]()
1. [Maximum Number of Balloons (easy)]()
1. [Longest Palindrome(easy)]()
1. [Ransom Note (easy)]()
## 10. Binary Search
1. [Binary search basic]()
1. [Upper Bound/ Ceiling]()
1. [First and Last position]()
1. [Count number of occurences]()
1. [Search in infinite Sorted array]()
1. [Peak index in Mountain]()
1. [Find peak in mountain range]()
1. [Find minimum in rotated sorted array]()
1. [Find number of rotations to sorted array]()
1. [Search in rotated sorted array]()
1. [KOKO eating BANANAS]()
1. [Min num of days to make m bouquets]()
1. [Aggresive cows]()
1. [H index 2]()
1. [Max candies to k children]()
1. [Capacity to ship packages in d days]()
1. [Book Allocation Problem]()
1. [Split largest arrray]()
1. [Search 2 D matrix]()
1. [Search 2D matrix (Hard)]()
1. [kth smallest in sorted matrix]()
1. [kth smallest in multiplication matrix]()
1. [Median of 2 sorted arrays]()
## 11. Heap
### 1. Kth
1. [kth smallest]()
1. [kth largest]()
1. [TOP K frequent Elements]()
1. [Top K frequent Words]()
### 2. K closest
1. [K closest points to origin]()
1. [Find K closest elements]()
1. [Kth weakest row in Matrix]()
### 3. Heap as pointer
1. [Merge K Sorted Arrays]()
1. [Kth Smallest in Sorted Matrix]()
### 4. GREEDY+heap
1. [LAST STONE WEIGHT]()
1. [CPU Task Scheduler]()
1. [Reorganize String]()
1. [Min number of refueling stops]()
1. [IPO]()
1. [Course Scheduler 3]()
### 5. Two heaps
1. [Find median in data stream]()
1. [Sliding Window Median (hard)]()
## 12. Recursion and Backtracking
1. [Fibonnaci]()
1. [Check if string is Pallindrome]()
1. [Check if Array is Sorted]()
1. [Sum of digits of a number]()
1. [Remove occurences of a character in string]()
1. [Generate parenthesis]()
1. [Letter Combinations of phone number]()
1. [Permutations]()
1. [Combination Sum]()
1. [Pallindrome partition]()
## 13. Tree
### 1. Traversal	Inorder
1. [Preorder]()
1. [Postorder]()
1. [Level Order]()
1. [ZigZag Order]()
1. [Level Order II]()
### 2. Mirror and Symmetry	Invert Tree
1. [Symmetric Tree]()
1. [Same Tree]()
1. [Subtree of another TREE]()
1. [Flip Equivalent Tree]()
### 3. Search	LCA of Binary TREE
1. [Binary Search Tree]()
1. [LCA of BST]()
1. [LCA of Deepest Leaves]()
1. [Two Sum IV]()
1. [Kth smallest element in BST]()
### 4. Validation	Minimum Depth of Binary Tree
1. [Maximum Depth of Binary Tree]()
1. [Balanced Binary Tree]()
1. [Diameter of Binary Tree]()
1. [Check Completeness of Binary Tree]()
1. [Validate BST]()
1. [Recover BST]()
### 5. Path SUM	Path Sum
1. [Path Sum II]()
1. [Sum of Root to Leaf]()
1. [Maximum Path Sum]()
### 6. Construction	Contruct tree from preorder and inorder
1. [Contruct tree from postorder and inorder]()
1. [Sorted Array to BST]()
## 14. Graphs
1. [Construct Adjancency List from EDGES+Nodes]()
1. [Graph DFS]()
1. [GRAPH BFS]()
1. [Number of Islands]()
1. [Number of Provinces]()
1. [Rotten Oranges]()
1. [Cycle detection in undirected graph]()
1. [Cycle detection in directed graph]()
1. [Topological sort]()
1. [Bipartite Graph/ Graph Coloring]()
1. [Surrounded Regoins]()
1. [Shortest Path in Non-Weighted Graph]()
1. [Dijkstra's Algorithm]()
1. [Network Delay]()
1. [Path With Minimum Effort]()
1. [Swim in Rising Water]()
1. [Bellman ford]()
1. [Cheapest Path in K stops]()
1. [Prim MST]()
1. [Word Ladder]()
## 15. Dynamic Programming
1. [Fibonacci]()
1. [Climbing Stairs]()
1. [House Robber]()
1. [0/1 Knapsack]()
1. [tabulation Intro]()
1. [0/1 Knapsack Tabulation]()
1. [Subset sum]()
1. [Target Sum]()
1. [LIS]()
1. [LIS Tabulation]()
1. [LCS]()
1. [Unique Paths]()
1. [Buy Sell Stocks]()
1. [MIn cost to cut stick]()
1. [Revision]()
## 16. Greedy
1. [Lemonade]()
1. [Jump Game]()
1. [Assign cookies]()
1. [Fractional Knapsack]()


<!-- ### [1. Arrays / Strings](./problem_solving_patterns/1_arrays_and_strings.md)
- Simulation
- Prefix sums
- Difference arrays
- Two pointers
- Sliding window
- Hashing / frequency maps
- Sorting
- Binary search
- Greedy
### [2. Linked Lists](./problem_solving_patterns/2_linked_lists.md)
- Dummy nodes
- Fast & slow pointers
- Reversal
- Merging
- Cycle detection
### [3. Recursion / Backtracking](./problem_solving_patterns/3_recursion_and_backtracking.md)
- Decision trees
- Subsequences
- Permutations
- Combinations
- Grid exploration
- Constraint satisfaction
### [4. Trees / Graphs](./problem_solving_patterns/4_trees_and_graphs.md)
- DFS
- BFS
- Multi-source BFS
- Connected components
- Topological sort
- Cycle detection
- Shortest paths
- Union Find
### [5. Dynamic Programming](./problem_solving_patterns/5_dp.md)
- 1D DP
- 2D / grid DP
- Subsequences
- Knapsack
- Interval DP
- Digit DP
- Tree DP
- Bitmask DP
### [6. Heaps / Priority Queues](./problem_solving_patterns/6_heaps_and_prioriy_queues.md)
- Top K
- Scheduling
- Merge K sorted lists
- Greedy with priority queues
### [7. Monotonic Data Structures](./problem_solving_patterns/7_monotonic_data_strucutres.md)
- Monotonic stack
- Monotonic queue
- Next greater/smaller element
- Histogram / contribution technique
### [8. Advanced Graphs](./problem_solving_patterns/8_advanced_graphs.md)
- Dijkstra
- 0-1 BFS
- Bellman-Ford
- Floyd-Warshall
- MST
- SCC

### [9. Bit Manipulation](./problem_solving_patterns/9_bit_manipulation.md)
- XOR
- Bits as states
- Subsets
- Bitmask enumeration
- Bitmask DP -->
