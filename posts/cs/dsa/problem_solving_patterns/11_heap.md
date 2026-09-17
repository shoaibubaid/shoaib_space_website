---
title: Problem Patterns - 11. Heap Pattern
era: Pattern type 11 
readTime: 10 min read
excerpt: 
floats: bulb.png, cpu.png, gpu.png, keyboard.png, monitor.png, ram.png, star_yellow.png
background: cs/dsa.png
---
# 11. Heap

A Heap is a complete binary tree data structure that satisfies the heap property: 
- In a min-heap, the value of each child is greater than or equal to its parent and 
- In a max-heap, the value of each child is less than or equal to its parent. 

Heaps are commonly used to implement priority queues, where the smallest (or largest) element is always at the root.

[Heap Data structure GFG](https://www.geeksforgeeks.org/dsa/heap-data-structure/)

## 1. Kth
### 1. [kth smallest](https://www.geeksforgeeks.org/problems/kth-smallest-element5635/1)

Given an integer array `arr[]` and an integer `k`, find and return the **kth smallest** element in the given array.
Note: The kth smallest element is determined based on the sorted order of the array.

```cpp
// with sorting applied
class Solution {
	public:
	int kthSmallest(vector<int> &arr, int k) {
		sort(arr.begin(), arr.end());
		
		return arr[k - 1];
		
	}
};
```

```cpp
// without sorting the array

class Solution {
public:
    int kthSmallest(vector<int>& arr, int k) {

        int left = 0;
        int right = arr.size() - 1;

        while(left <= right) {

            int pivot = arr[right];
            int pos = left;

            // Partition
            for(int i = left; i < right; i++) {
                if(arr[i] <= pivot) {
                    swap(arr[i], arr[pos]);
                    pos++;
                }
            }

            swap(arr[pos], arr[right]);

            // pos is the pivot's sorted position
            if(pos == k - 1) {
                return arr[pos];
            }
            else if(pos > k - 1) {
                right = pos - 1;
            }
            else {
                left = pos + 1;
            }
        }

        return -1;
    }
};
```

### 2. [kth largest](https://leetcode.com/problems/kth-largest-element-in-an-array/description/)

Given an integer array `nums` and an integer `k`, return the **kth largest** element in the array.

Note that it is the kth largest element in the sorted order, not the kth distinct element.

Can you solve it without sorting?

**solution**:
**Intuition**

To find the `k`th largest element, we don't need to sort the entire array. Instead, we can maintain a collection of only the `k` largest elements seen so far using a Min-Heap.

Because a `min-heap` always keeps the smallest of its current elements at the top, maintaining a min-heap of size k guarantees that the element at the top is the k 
th
  largest overall once we've processed all numbers.

```cpp
class Solution {
public:
    int findKthLargest(vector<int>& nums, int k) {
        priority_queue<int, vector<int>, greater<int>> min_heap;
        /*
        priority_queue<
            int,                  // 1. Type of elements
            vector<int>,          // 2. Underlying container
            greater<int>          // 3. Comparison rule
        > min_heap;
        */

        for(int i = 0; i < nums.size(); i++) {
            min_heap.push(nums[i]);

            if(min_heap.size() > k) {
                min_heap.pop();
            }
        }

        return min_heap.top();
    }
};
```

### 3. [TOP K frequent Elements](https://leetcode.com/problems/top-k-frequent-elements/description/)

Given an integer array `nums` and an integer `k`, return the `k` most frequent elements. You may return the answer in any order.

```cpp
class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {

        unordered_map<int, int> mp;

        // Count frequency
        for(int num : nums) {
            mp[num]++;
        }

        // {frequency, number}
        priority_queue<
            pair<int, int>,
            vector<pair<int, int>>,
            greater<pair<int, int>>
        > min_heap;

        // find those k frequent elements
        for(auto [num, freq] : mp) {

            min_heap.push({freq, num});

            if(min_heap.size() > k) {
                min_heap.pop();
            }
        }

        vector<int> ans;

        // Add them to the answer
        while(!min_heap.empty()) {
            ans.push_back(min_heap.top().second);
            min_heap.pop();
        }

        return ans;
    }
};
```
### 4. [Top K frequent Words](https://leetcode.com/problems/top-k-frequent-words/description/)

Given an array of strings `words` and an integer `k`, return the `k` most frequent strings.

Return the answer sorted by the frequency from highest to lowest. Sort the words with the same frequency by their **lexicographical order**.

```cpp
class Solution {
public:
    struct Compare {
        bool operator()(const pair<int, string>& a,
                        const pair<int, string>& b) {

            // Lower frequency has lower priority
            if(a.first != b.first) {
                return a.first > b.first;
            }

            // For same frequency, lexicographically
            // larger word has lower priority
            return a.second < b.second;
        }
    };

    vector<string> topKFrequent(vector<string>& words, int k) {

        unordered_map<string, int> mp;

        for(string word : words) {
            mp[word]++;
        }

        priority_queue<
            pair<int, string>,
            vector<pair<int, string>>,
            Compare
        > min_heap;

        for(auto [word, freq] : mp) {

            min_heap.push({freq, word});

            if(min_heap.size() > k) {
                min_heap.pop();
            }
        }

        vector<string> ans;

        while(!min_heap.empty()) {
            ans.push_back(min_heap.top().second);
            min_heap.pop();
        }

        // Heap gives us the weakest of the selected elements first,
        // so reverse to get required ordering.
        reverse(ans.begin(), ans.end());

        return ans;
    }
};
```

## 2. K closest
### 1. [K closest points to origin](https://leetcode.com/problems/k-closest-points-to-origin/description/)

Given an array of `points` where `points[i] = [xi, yi]` represents a point on the **X-Y** plane and an integer `k`, return the `k` closest points to the origin `(0, 0)`.

The distance between two points on the X-Y plane is the **Euclidean distance** (i.e. $\sqrt{(x_1-x_2)^2 + (y_1-y_2)^2}$).

You may return the answer in any order. The answer is guaranteed to be unique (except for the order that it is in).

```cpp
class Solution {
public:
    vector<vector<int>> kClosest(vector<vector<int>>& points, int k) {

        // {distance, point}
        priority_queue<
            pair<int, vector<int>>
        > max_heap;

        for(auto point : points) {

            int x = point[0];
            int y = point[1];

            int dist = x * x + y * y;

            max_heap.push({dist, point});

            if(max_heap.size() > k) {
                max_heap.pop();
            }
        }

        vector<vector<int>> ans;

        while(!max_heap.empty()) {
            ans.push_back(max_heap.top().second);
            max_heap.pop();
        }

        return ans;
    }
};
```

### 2. [Find K closest elements](https://leetcode.com/problems/find-k-closest-elements/description/)

Given a sorted integer array `arr`, two integers `k` and `x`, return the `k` closest integers to `x` in the array. The result should also be sorted in ascending order.

An integer `a` is closer to `x` than an integer `b` if:

- `|a - x| < |b - x|`, or
- `|a - x| == |b - x|` and `a < b`

```cpp
// solution with HEAP (NOT better)
class Solution {
public:
    vector<int> findClosestElements(vector<int>& arr, int k, int x) {

        // {distance, value}
        priority_queue<pair<int, int>> max_heap;

        for(int num : arr) {

            int distance = abs(num - x);

            max_heap.push({distance, num});

            if(max_heap.size() > k) {
                max_heap.pop();
            }
        }

        vector<int> ans;

        while(!max_heap.empty()) {
            ans.push_back(max_heap.top().second);
            max_heap.pop();
        }

        // Problem requires ascending order
        sort(ans.begin(), ans.end());

        return ans;
    }
};
```

```cpp
// Alternate better approach
class Solution {
public:
    vector<int> findClosestElements(vector<int>& arr, int k, int x) {

        int left = 0;
        int right = arr.size() - k;

        while(left < right) {

            int mid = left + (right - left) / 2;

            // Compare the two possible windows:
            // [mid ... mid+k-1]
            // [mid+1 ... mid+k]

            if(x - arr[mid] > arr[mid + k] - x) {
                left = mid + 1;
            }
            else {
                right = mid;
            }
        }

        return vector<int>(
            arr.begin() + left,
            arr.begin() + left + k
        );
    }
};
```


### 3. [Kth weakest row in Matrix](https://leetcode.com/problems/the-k-weakest-rows-in-a-matrix/description/)

You are given an `m x n` binary matrix mat of `1`'s (representing soldiers) and `0`'s (representing civilians). The soldiers are positioned in front of the civilians. That is, all the `1`'s will appear to the left of all the `0`'s in each row.

A row `i` is weaker than a row `j` if one of the following is true:

- The number of soldiers in row `i` is less than the number of soldiers in row `j`.
- Both rows have the same number of soldiers and `i < j`.

Return the indices of the `k` **weakest rows** in the matrix ***ordered from weakest to strongest***.

```cpp
class Solution {
public:
    vector<int> kWeakestRows(vector<vector<int>>& mat, int k) {

        vector<pair<int, int>> rows;

        for(int i = 0; i < mat.size(); i++) {
            int soldiers = 0;

            for(int j = 0; j < mat[i].size(); j++) {
                soldiers += mat[i][j];
            }

            rows.push_back({soldiers, i});
        }

        sort(rows.begin(), rows.end());

        vector<int> ans;

        for(int i = 0; i < k; i++) {
            ans.push_back(rows[i].second);
        }

        return ans;
    }
};
```


```cpp
class Solution {
public:
    vector<int> kWeakestRows(vector<vector<int>>& mat, int k) {

        vector<pair<int, int>> rows;

        for(int i = 0; i < mat.size(); i++) {

            int left = 0;
            int right = mat[i].size();

            while(left < right) {
                int mid = left + (right - left) / 2;

                if(mat[i][mid] == 1)
                    left = mid + 1;
                else
                    right = mid;
            }

            // left = number of soldiers
            rows.push_back({left, i});
        }

        sort(rows.begin(), rows.end());

        vector<int> ans;

        for(int i = 0; i < k; i++) {
            ans.push_back(rows[i].second);
        }

        return ans;
    }
};
```

## 3. Heap as pointer
### 1. [Merge K Sorted Arrays](https://www.geeksforgeeks.org/problems/merge-k-sorted-arrays/1)
### 2. [Kth Smallest in Sorted Matrix](https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/description/)
## 4. GREEDY+heap
### 1. [LAST STONE WEIGHT](https://leetcode.com/problems/last-stone-weight/description/)
### 2. [CPU Task Scheduler](https://leetcode.com/problems/task-scheduler/description/)
### 3. [Reorganize String](https://leetcode.com/problems/reorganize-string/)
### 4. [Min number of refueling stops](https://leetcode.com/problems/minimum-number-of-refueling-stops/description/)
### 5. [IPO](https://leetcode.com/problems/ipo/description/)
### 6. [Course Scheduler 3](https://leetcode.com/problems/course-schedule-iii/description/)
## 5. Two heaps
### 1. [Find median in data stream](https://leetcode.com/problems/find-median-from-data-stream/description/)
### 2. [Sliding Window Median (hard)](https://leetcode.com/problems/sliding-window-median/description/)