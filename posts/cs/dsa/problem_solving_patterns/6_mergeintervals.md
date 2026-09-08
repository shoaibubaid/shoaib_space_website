---
title: Problem Patterns - 6. Merge Intervals
era: Pattern type 6 
readTime: 10 min read
excerpt: 
floats: bulb.png, cpu.png, gpu.png, keyboard.png, monitor.png, ram.png, star_yellow.png
background: cs/dsa.png
---
# 6. Merge Intervals
### 1. [Merge Intervals (medium)](https://leetcode.com/problems/merge-intervals/description/)

Given an array of `intervals` where `intervals[i] = [starti, endi]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.

```cpp
class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end());
        vector<vector<int>> ans;

        ans.push_back(intervals[0]);

        for(int i = 1; i < intervals.size(); i++){
            if(ans.back()[1] >= intervals[i][0]){
                ans.back()[1] = max(ans.back()[1], intervals[i][1]);
            }
            else{
                ans.push_back(intervals[i]);
            }
        }
        return ans;
    }
};
```

### 2. [Insert Interval (medium)](https://leetcode.com/problems/insert-interval/)

```cpp
class Solution {
public:
    vector<vector<int>> insert(vector<vector<int>>& intervals, vector<int>& newInterval) {
        vector<vector<int>> ans;
        int i = 0;

        // Intervals completely before newInterval
        while (i < intervals.size() && intervals[i][1] < newInterval[0]) {
            ans.push_back(intervals[i]);
            i++;
        }

        // Merge overlapping intervals
        while (i < intervals.size() && intervals[i][0] <= newInterval[1]) {
            newInterval[0] = min(newInterval[0], intervals[i][0]);
            newInterval[1] = max(newInterval[1], intervals[i][1]);
            i++;
        }

        // Add the merged interval
        ans.push_back(newInterval);

        // Intervals completely after newInterval
        while (i < intervals.size()) {
            ans.push_back(intervals[i]);
            i++;
        }

        return ans;
    }
};
```
### 3. [Intervals Intersection (medium)](https://leetcode.com/problems/interval-list-intersections/description/)
### 4. [Overlapping Intervals](https://www.geeksforgeeks.org/check-if-any-two-intervals-overlap-among-a-given-set-of-intervals/)
### 5. [Problem Challenge 1: Minimum Meeting Rooms (hard)](https://www.geeksforgeeks.org/problems/attend-all-meetings-ii/1)
### 6. [Problem Challenge 2: Maximum CPU Load (hard)](https://www.geeksforgeeks.org/maximum-cpu-load-from-the-given-list-of-jobs/)
### 7. [Problem Challenge 3: Employee Free Time (hard)](https://www.codertrain.co/employee-free-time)