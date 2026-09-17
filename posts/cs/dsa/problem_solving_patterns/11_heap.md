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
Given a 2D matrix **mat[][]** of size **n x m**. Each row in the matrix is sorted in non-decreasing order, merge all the rows and return a single sorted array that contains all the elements of the matrix.

```cpp
class Solution {
  public:
    vector<int> mergeArrays(vector<vector<int>> &mat) {
        int n = mat.size();

                // {value, row, column}
                priority_queue<
                    vector<int>,
                    vector<vector<int>>,
                    greater<vector<int>>
                > min_heap;

                // Put first element of every row into heap
                for(int i = 0; i < n; i++) {
                    if(!mat[i].empty()) {
                        min_heap.push({mat[i][0], i, 0});
                    }
                }

                vector<int> ans;

                while(!min_heap.empty()) {

                    auto curr = min_heap.top();
                    min_heap.pop();

                    int value = curr[0];
                    int row = curr[1];
                    int col = curr[2];

                    ans.push_back(value);

                    // Add next element from the same row
                    if(col + 1 < mat[row].size()) {
                        min_heap.push({
                            mat[row][col + 1],
                            row,
                            col + 1
                        });
                    }
                }

                return ans;
    }
};
```

### 2. [Kth Smallest in Sorted Matrix](https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/description/)

Given an `n x n` `matrix` where each of the rows and columns is sorted in ascending order, return the `kth` smallest element in the matrix.

Note that it is the `kth` smallest element in the sorted order, not the `kth` distinct element.

You must find a solution with a memory complexity better than `O(n2)`.

```cpp
class Solution {
public:
    int kthSmallest(vector<vector<int>>& matrix, int k) {

        int n = matrix.size();

        int low = matrix[0][0];
        int high = matrix[n - 1][n - 1];

        while(low < high) {

            int mid = low + (high - low) / 2;

            // Count elements <= mid
            int count = 0;

            int row = n - 1;
            int col = 0;

            // Start from bottom-left
            while(row >= 0 && col < n) {

                if(matrix[row][col] <= mid) {
                    // Everything above this element
                    // in this column is also <= mid
                    count += row + 1;
                    col++;
                }
                else {
                    // Current element is too large
                    row--;
                }
            }

            if(count < k) {
                low = mid + 1;
            }
            else {
                high = mid;
            }
        }

        return low;
    }
};
```

## 4. GREEDY+heap
### 1. [LAST STONE WEIGHT](https://leetcode.com/problems/last-stone-weight/description/)

You are given an array of integers `stones` where `stones[i]` is the weight of the `i`th stone.

We are playing a game with the stones. On each turn, we choose the heaviest two stones and smash them together. Suppose the heaviest two stones have weights `x` and `y` with `x <= y`. The result of this smash is:

- If `x == y`, both stones are destroyed, and
- If `x != y`, the stone of weight `x` is destroyed, and the stone of weight `y` has new weight `y - x`.

At the end of the game, there is at most one stone left.

Return the weight of the last remaining stone. If there are no stones left, return `0`.

```cpp
class Solution {
public:
    int lastStoneWeight(vector<int>& stones) {
        priority_queue<int> max_heap;

        for(int stone : stones) {
            max_heap.push(stone);
        }

        while(max_heap.size() > 1) {

            int y = max_heap.top();
            max_heap.pop();

            int x = max_heap.top();
            max_heap.pop();

            if(x != y) {
                max_heap.push(y - x);
            }
        }

        if(max_heap.empty()) {
            return 0;
        }

        return max_heap.top();
    }
};
```


### 2. [CPU Task Scheduler](https://leetcode.com/problems/task-scheduler/description/)

You are given an array of CPU `tasks`, each labeled with a letter from A to Z, and a number `n`. Each CPU interval can be idle or allow the completion of one task. Tasks can be completed in any order, but there's a constraint: there has to be a gap of at least `n` intervals between two tasks with the same label.

Return the minimum number of CPU intervals required to complete all tasks.

**Greedy + Max Heap**
```cpp
class Solution {
public:
    int leastInterval(vector<char>& tasks, int n) {

        unordered_map<char, int> freq;

        for(char task : tasks) {
            freq[task]++;
        }

        priority_queue<int> max_heap;

        for(auto [task, count] : freq) {
            max_heap.push(count);
        }

        int time = 0;

        while(!max_heap.empty()) {

            vector<int> used;

            // One cycle has at most n + 1 tasks
            for(int i = 0; i <= n; i++) {

                if(!max_heap.empty()) {

                    int count = max_heap.top();
                    max_heap.pop();

                    count--;

                    if(count > 0) {
                        used.push_back(count);
                    }
                }

                time++;

                // Nothing left to execute
                if(max_heap.empty() && used.empty()) {
                    break;
                }
            }

            // Put remaining tasks back
            for(int count : used) {
                max_heap.push(count);
            }
        }

        return time;
    }
};
```

### 3. [Reorganize String](https://leetcode.com/problems/reorganize-string/)

Given a string `s`, rearrange the characters of `s` so that any two adjacent characters are not the same.

Return any possible rearrangement of `s` or return `""` if not possible.

Example 1:

- Input: s = "aab"
- Output: "aba"

Example 2:

- Input: s = "aaab"
- Output: ""

**Greedy + Max Heap**

```cpp
class Solution {
public:
    string reorganizeString(string s) {

        unordered_map<char, int> freq;

        for(char c : s) {
            freq[c]++;
        }

        // {frequency, character}
        priority_queue<pair<int, char>> max_heap;

        for(auto [ch, count] : freq) {
            max_heap.push({count, ch});
        }

        string ans;

        while(max_heap.size() >= 2) {

            auto [freq1, ch1] = max_heap.top();
            max_heap.pop();

            auto [freq2, ch2] = max_heap.top();
            max_heap.pop();

            ans += ch1;
            ans += ch2;

            freq1--;
            freq2--;

            if(freq1 > 0) {
                max_heap.push({freq1, ch1});
            }

            if(freq2 > 0) {
                max_heap.push({freq2, ch2});
            }
        }

        // One character may remain
        if(!max_heap.empty()) {
            auto [count, ch] = max_heap.top();

            if(count > 1) {
                return "";
            }

            // Make sure it doesn't equal the last character
            if(!ans.empty() && ans.back() == ch) {
                return "";
            }

            ans += ch;
        }

        return ans;
    }
};
```

### 4. [Min number of refueling stops](https://leetcode.com/problems/minimum-number-of-refueling-stops/description/)

<font color="red">**HARD**</font>

A car travels from a starting position to a destination which is `target` miles east of the starting position.

There are gas stations along the way. The gas stations are represented as an array `stations` where `stations[i] = [positioni, fueli]` indicates that the `ith` gas station is `position_i` miles east of the starting position and has `fuel_i` liters of gas.

The car starts with an infinite tank of gas, which initially has `startFuel` liters of fuel in it. It uses one liter of gas per one mile that it drives. When the car reaches a gas station, it may stop and refuel, transferring all the gas from the station into the car.

Return the minimum number of refueling stops the car must make in order to reach its destination. If it cannot reach the destination, return `-1`.

Note that if the car reaches a gas station with `0` fuel left, the car can still refuel there. If the car reaches the destination with `0` fuel left, it is still considered to have arrived.

**Greedy + Max Heap**
```cpp
class Solution {
public:
    int minRefuelStops(int target, int startFuel, vector<vector<int>>& stations) {
        priority_queue<int> max_heap;

        int fuel = startFuel;
        int stops = 0;
        int i = 0;

        while(fuel < target) {

            // Add all stations we can currently reach
            while(i < stations.size() &&
                  stations[i][0] <= fuel) {

                max_heap.push(stations[i][1]);
                i++;
            }

            // No reachable station left
            if(max_heap.empty()) {
                return -1;
            }

            // Take the station with maximum fuel
            fuel += max_heap.top();
            max_heap.pop();

            stops++;
        }

        return stops;
    }
};
```

### 5. [IPO](https://leetcode.com/problems/ipo/description/)

<font color="red">**HARD**</font>

Suppose LeetCode will start its **IPO** soon. In order to sell a good price of its shares to Venture Capital, LeetCode would like to work on some projects to increase its capital before the IPO. Since it has limited resources, it can only finish at most `k` distinct projects before the IPO. Help LeetCode design the best way to maximize its total capital after finishing at most `k` distinct projects.

You are given `n` projects where the `ith` project has a pure profit `profits[i]` and a minimum capital of `capital[i]` is needed to start it.

Initially, you have `w` capital. When you finish a project, you will obtain its pure profit and the profit will be added to your total capital.

Pick a list of at most `k` distinct projects from given projects to maximize your final capital, and return the final maximized capital.

The answer is guaranteed to fit in a 32-bit signed integer.


**Greedy + Heap**

- Sort projects by required capital.
- Use a max-heap for profits.

```cpp
class Solution {
public:
    int findMaximizedCapital(int k, int w,
                             vector<int>& profits,
                             vector<int>& capital) {

        int n = profits.size();

        // {required capital, profit}
        vector<pair<int, int>> projects;

        for(int i = 0; i < n; i++) {
            projects.push_back({capital[i], profits[i]});
        }

        // Sort by required capital
        sort(projects.begin(), projects.end());

        // Max heap of profits
        priority_queue<int> max_heap;

        int i = 0;

        for(int project = 0; project < k; project++) {

            // Add all projects we can currently afford
            while(i < n && projects[i].first <= w) {
                max_heap.push(projects[i].second);
                i++;
            }

            // No project can be started
            if(max_heap.empty()) {
                break;
            }

            // Choose maximum profit
            w += max_heap.top();
            max_heap.pop();
        }

        return w;
    }
};
```

### 6. [Course Scheduler 3](https://leetcode.com/problems/course-schedule-iii/description/)

<font color="red">**HARD**</font>

There are `n` different online courses numbered from `1` to `n`. You are given an array `courses` where `courses[i] = [durationi, lastDayi]` indicate that the `ith` course should be taken continuously for `durationi` days and must be finished before or on `lastDayi`.

You will start on the `1st` day and you cannot take two or more courses simultaneously.

Return the maximum number of courses that you can take.

**Greedy + Heap**

```cpp
class Solution {
public:
    int scheduleCourse(vector<vector<int>>& courses) {

        // Sort by deadline
        sort(courses.begin(), courses.end(),
             [](const vector<int>& a, const vector<int>& b) {
                 return a[1] < b[1];
             });

        // Max heap of course durations
        priority_queue<int> max_heap;

        int time = 0;

        for(auto course : courses) {

            int duration = course[0];
            int deadline = course[1];

            time += duration;
            max_heap.push(duration);

            // Cannot finish all selected courses by deadline
            if(time > deadline) {
                time -= max_heap.top();
                max_heap.pop();
            }
        }

        return max_heap.size();
    }
};
```

## 5. Two heaps
### 1. [Find median in data stream](https://leetcode.com/problems/find-median-from-data-stream/description/)

<font color="red">**HARD**</font>

The **median** is the middle value in an ordered integer list. If the size of the list is even, there is no middle value, and the median is the mean of the two middle values.

- For example, for `arr = [2,3,4]`, the median is `3`.
- For example, for `arr = [2,3]`, the median is `(2 + 3) / 2 = 2.5`.

Implement the MedianFinder class:

- `MedianFinder()` initializes the MedianFinder object.
- `void addNum(int num)` adds the integer num from the data stream to the data structure.
- `double findMedian()` returns the median of all elements so far. Answers within 10-5 of the actual answer will be accepted.

```cpp
class MedianFinder {
private:
    // Smaller half
    priority_queue<int> left;

    // Larger half
    priority_queue<int, vector<int>, greater<int>> right;

public:
    MedianFinder() {
        
    }
    
    void addNum(int num) {

        // First put the number into left
        if(left.empty() || num <= left.top()) {
            left.push(num);
        }
        else {
            right.push(num);
        }

        // Balance the heaps
        if(left.size() > right.size() + 1) {
            right.push(left.top());
            left.pop();
        }
        else if(right.size() > left.size()) {
            left.push(right.top());
            right.pop();
        }
    }
    
    double findMedian() {

        if(left.size() > right.size()) {
            return left.top();
        }

        return (left.top() + right.top()) / 2.0;
    }
};
```

### 2. [Sliding Window Median (hard)](https://leetcode.com/problems/sliding-window-median/description/)

<font color="red">**HARD**</font>

The median is the middle value in an ordered integer list. If the size of the list is even, there is no middle value. So the median is the mean of the two middle values.

- For examples, if `arr = [2,3,4]`, the median is `3`.
- For examples, if `arr = [1,2,3,4]`, the median is `(2 + 3) / 2 = 2.5`.

You are given an integer array `nums` and an integer `k`. There is a sliding window of size k which is moving from the very left of the array to the very right. You can only see the k numbers in the window. Each time the sliding window moves right by one position.

Return the median array for each window in the original array. Answers within `10^-5` of the actual value will be accepted.

```cpp
class Solution {
public:
    vector<double> medianSlidingWindow(vector<int>& nums, int k) {

        // left = smaller half
        // right = larger half
        multiset<int> left, right;

        vector<double> ans;

        // Keep:
        // left.size() == right.size()
        // OR
        // left.size() == right.size() + 1

        auto balance = [&]() {

            // left has too many
            while(left.size() > right.size() + 1) {
                right.insert(*left.rbegin());
                left.erase(prev(left.end()));
            }

            // right has too many
            while(right.size() > left.size()) {
                left.insert(*right.begin());
                right.erase(right.begin());
            }
        };

        auto add = [&](int num) {

            if(left.empty() || num <= *left.rbegin()) {
                left.insert(num);
            }
            else {
                right.insert(num);
            }

            balance();
        };

        auto remove = [&](int num) {

            if(left.find(num) != left.end()) {
                left.erase(left.find(num));
            }
            else {
                right.erase(right.find(num));
            }

            balance();
        };

        auto getMedian = [&]() -> double {

            if(left.size() > right.size()) {
                return *left.rbegin();
            }

            return ((double)*left.rbegin() + *right.begin()) / 2.0;
        };

        // Build first window
        for(int i = 0; i < k; i++) {
            add(nums[i]);
        }

        ans.push_back(getMedian());

        // Slide window
        for(int i = k; i < nums.size(); i++) {

            // Remove element leaving window
            remove(nums[i - k]);

            // Add new element
            add(nums[i]);

            ans.push_back(getMedian());
        }

        return ans;
    }
};
```