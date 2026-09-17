---
title: Problem Patterns - 10. Binary Search
era: Pattern type 10 
readTime: 10 min read
excerpt: 
floats: bulb.png, cpu.png, gpu.png, keyboard.png, monitor.png, ram.png, star_yellow.png
background: cs/dsa.png
---

# 10. Binary Search
### 1. [Binary search basic](https://leetcode.com/problems/binary-search/)

Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If target exists, then return its index. Otherwise, return `-1`.

You must write an algorithm with O(log n) runtime complexity.

```cpp
class Solution {
public:
    int search(vector<int>& nums, int target) {
        int n = nums.size();
        int left = 0;
        int right = n-1;

        while(left <= right){
            int mid = (left + right)/2;

            if(nums[mid] == target) return mid;
            if(nums[mid] > target){
                right = mid - 1;
            }
            else{
                left = mid + 1;
            }
        }

        return -1;
    }
};
```

### 2. [Upper Bound/ Ceiling](https://www.geeksforgeeks.org/problems/ceil-in-a-sorted-array/1)

Given a sorted array `arr` and an integer `x`, find the **ceiling** of `x`: the smallest element in the array that is `>= x`. Return `-1` if no such element exists.

```cpp
class Solution {
public:
    int getCeil(vector<int>& arr, int x) {
        int left = 0, right = arr.size() - 1;
        int ans = -1;

        while(left <= right) {
            int mid = left + (right - left) / 2;

            if(arr[mid] >= x) {
                ans = arr[mid];
                right = mid - 1; // look for something even smaller that still qualifies
            }
            else {
                left = mid + 1;
            }
        }

        return ans;
    }
};
```

### 3. [First and Last position](https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/)

Given an array of integers `nums` sorted in ascending order, find the starting and ending position of a given `target` value. Return `[-1, -1]` if not found. Must run in O(log n).

```cpp
class Solution {
public:
    int findBound(vector<int>& nums, int target, bool findFirst) {
        int left = 0, right = nums.size() - 1;
        int ans = -1;

        while(left <= right) {
            int mid = left + (right - left) / 2;

            if(nums[mid] == target) {
                ans = mid;
                if(findFirst) right = mid - 1; // keep searching left
                else left = mid + 1;           // keep searching right
            }
            else if(nums[mid] < target) {
                left = mid + 1;
            }
            else {
                right = mid - 1;
            }
        }

        return ans;
    }

    vector<int> searchRange(vector<int>& nums, int target) {
        return {findBound(nums, target, true), findBound(nums, target, false)};
    }
};
```

### 4. [Count number of occurences](https://www.geeksforgeeks.org/problems/number-of-occurrence2259/1)

Given a sorted array `arr` with possibly repeated elements, count how many times a given value `x` occurs in it.

**Intuition**: find the first and last position of `x`; the count is `last - first + 1`.

```cpp
class Solution {
public:
    int findBound(vector<int>& arr, int x, bool findFirst) {
        int left = 0, right = arr.size() - 1;
        int ans = -1;

        while(left <= right) {
            int mid = left + (right - left) / 2;

            if(arr[mid] == x) {
                ans = mid;
                if(findFirst) right = mid - 1;
                else left = mid + 1;
            }
            else if(arr[mid] < x) {
                left = mid + 1;
            }
            else {
                right = mid - 1;
            }
        }

        return ans;
    }

    int countOccurrence(vector<int>& arr, int x) {
        int first = findBound(arr, x, true);
        if(first == -1) return 0;

        int last = findBound(arr, x, false);
        return last - first + 1;
    }
};
```

### 5. [Search in infinite Sorted array](https://www.geeksforgeeks.org/find-position-element-sorted-array-infinite-numbers/)

Given a sorted array whose size is not known in advance (conceptually infinite), find the index of a given `target`. Return `-1` if it doesn't exist.

**Intuition**: exponentially grow a search window (doubling the right boundary) until it brackets the target, then binary search within that window.

```cpp
class Solution {
public:
    int searchInBounds(vector<int>& arr, int left, int right, int target) {
        while(left <= right) {
            int mid = left + (right - left) / 2;

            if(mid >= (int)arr.size() || arr[mid] > target) {
                right = mid - 1;
            }
            else if(arr[mid] < target) {
                left = mid + 1;
            }
            else {
                return mid;
            }
        }

        return -1;
    }

    int findInInfiniteArray(vector<int>& arr, int target) {
        int left = 0, right = 1;

        while(right < (int)arr.size() && arr[right] < target) {
            left = right;
            right *= 2;
        }

        return searchInBounds(arr, left, min(right, (int)arr.size() - 1), target);
    }
};
```

### 6. [Peak index in Mountain](https://leetcode.com/problems/peak-index-in-a-mountain-array/)

An array is a "mountain" if it strictly increases then strictly decreases. Given such an array, return the index of the peak element.

```cpp
class Solution {
public:
    int peakIndexInMountainArray(vector<int>& arr) {
        int left = 0, right = arr.size() - 1;

        while(left < right) {
            int mid = left + (right - left) / 2;

            if(arr[mid] < arr[mid + 1]) {
                left = mid + 1; // still climbing
            }
            else {
                right = mid; // descending, peak is here or to the left
            }
        }

        return left;
    }
};
```

### 7. [Find peak in mountain range](https://leetcode.com/problems/find-peak-element/)

Given an integer array `nums`, find any peak element (an element strictly greater than its neighbors) and return its index. The array's ends are considered to have `-infinity` neighbors. Must run in O(log n).

```cpp
class Solution {
public:
    int findPeakElement(vector<int>& nums) {
        int left = 0, right = nums.size() - 1;

        while(left < right) {
            int mid = left + (right - left) / 2;

            if(nums[mid] < nums[mid + 1]) {
                left = mid + 1;
            }
            else {
                right = mid;
            }
        }

        return left;
    }
};
```

### 8. [Find minimum in rotated sorted array](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/)

An originally ascending array is rotated at some unknown pivot. Given the rotated array `nums` (no duplicates), find the minimum element in O(log n).

```cpp
class Solution {
public:
    int findMin(vector<int>& nums) {
        int left = 0, right = nums.size() - 1;

        while(left < right) {
            int mid = left + (right - left) / 2;

            if(nums[mid] > nums[right]) {
                left = mid + 1; // minimum lies in the right half
            }
            else {
                right = mid;
            }
        }

        return nums[left];
    }
};
```

### 9. [Find number of rotations to sorted array](https://www.geeksforgeeks.org/problems/rotation4723/1)

Given a rotated sorted array (no duplicates), find how many times it was rotated (equivalently, the index of the minimum element).

```cpp
class Solution {
public:
    int findKRotation(vector<int>& arr) {
        int left = 0, right = arr.size() - 1;

        while(left < right) {
            int mid = left + (right - left) / 2;

            if(arr[mid] > arr[right]) {
                left = mid + 1;
            }
            else {
                right = mid;
            }
        }

        return left;
    }
};
```

### 10. [Search in rotated sorted array](https://leetcode.com/problems/search-in-rotated-sorted-array/description/)

Given a rotated sorted array `nums` (no duplicates) and a `target`, return its index, or `-1` if not present. Must run in O(log n).

**Intuition**: at each step, one half of the array (split at `mid`) is guaranteed to be normally sorted — check whether the target lies in that sorted half.

```cpp
class Solution {
public:
    int search(vector<int>& nums, int target) {
        int left = 0, right = nums.size() - 1;

        while(left <= right) {
            int mid = left + (right - left) / 2;

            if(nums[mid] == target) return mid;

            if(nums[left] <= nums[mid]) { // left half is sorted
                if(nums[left] <= target && target < nums[mid]) {
                    right = mid - 1;
                }
                else {
                    left = mid + 1;
                }
            }
            else { // right half is sorted
                if(nums[mid] < target && target <= nums[right]) {
                    left = mid + 1;
                }
                else {
                    right = mid - 1;
                }
            }
        }

        return -1;
    }
};
```

### 11. [KOKO eating BANANAS](https://leetcode.com/problems/koko-eating-bananas/)

Koko has `piles` of bananas and `h` hours before the guards return. She eats at a fixed speed `k` bananas/hour per pile (finishing a pile early wastes the rest of that hour). Find the minimum integer `k` that lets her eat all the bananas within `h` hours.

**Intuition**: binary search on the eating speed itself — higher speed always finishes in fewer or equal hours, so the feasibility is monotonic.

```cpp
class Solution {
public:
    bool canFinish(vector<int>& piles, int h, int speed) {
        long long hours = 0;

        for(int pile : piles) {
            hours += (pile + speed - 1) / speed; // ceil division
        }

        return hours <= h;
    }

    int minEatingSpeed(vector<int>& piles, int h) {
        int left = 1, right = *max_element(piles.begin(), piles.end());

        while(left < right) {
            int mid = left + (right - left) / 2;

            if(canFinish(piles, h, mid)) {
                right = mid;
            }
            else {
                left = mid + 1;
            }
        }

        return left;
    }
};
```

### 12. [Min num of days to make m bouquets](https://leetcode.com/problems/minimum-number-of-days-to-make-m-bouquets/)

Given `bloomDay[i]` (the day flower `i` blooms), and integers `m` and `k`, a bouquet needs `k` **adjacent** already-bloomed flowers. Find the minimum number of days to make `m` bouquets, or `-1` if impossible.

```cpp
class Solution {
public:
    bool canMake(vector<int>& bloomDay, int day, int m, int k) {
        int bouquets = 0, adjacent = 0;

        for(int b : bloomDay) {
            if(b <= day) {
                adjacent++;
                if(adjacent == k) {
                    bouquets++;
                    adjacent = 0;
                }
            }
            else {
                adjacent = 0;
            }
        }

        return bouquets >= m;
    }

    int minDays(vector<int>& bloomDay, int m, int k) {
        if((long long)m * k > (long long)bloomDay.size()) return -1;

        int left = *min_element(bloomDay.begin(), bloomDay.end());
        int right = *max_element(bloomDay.begin(), bloomDay.end());

        while(left < right) {
            int mid = left + (right - left) / 2;

            if(canMake(bloomDay, mid, m, k)) {
                right = mid;
            }
            else {
                left = mid + 1;
            }
        }

        return left;
    }
};
```

### 13. [Aggresive cows](https://www.geeksforgeeks.org/problems/aggressive-cows/1)

Given the positions of stalls and an integer `k` (number of cows), place all `k` cows in stalls to **maximize the minimum distance** between any two cows.

```cpp
class Solution {
public:
    bool canPlace(vector<int>& stalls, int cows, int minDist) {
        int placed = 1;
        int lastPos = stalls[0];

        for(int i = 1; i < (int)stalls.size(); i++) {
            if(stalls[i] - lastPos >= minDist) {
                placed++;
                lastPos = stalls[i];
            }
        }

        return placed >= cows;
    }

    int aggressiveCows(vector<int>& stalls, int k) {
        sort(stalls.begin(), stalls.end());

        int left = 1, right = stalls.back() - stalls.front();
        int ans = 0;

        while(left <= right) {
            int mid = left + (right - left) / 2;

            if(canPlace(stalls, k, mid)) {
                ans = mid;
                left = mid + 1;
            }
            else {
                right = mid - 1;
            }
        }

        return ans;
    }
};
```

### 14. [H index 2](https://leetcode.com/problems/h-index-ii/description/)

Given a researcher's citation counts `citations`, sorted in ascending order, return their **h-index**: the largest `h` such that at least `h` papers have `>= h` citations each.

```cpp
class Solution {
public:
    int hIndex(vector<int>& citations) {
        int n = citations.size();
        int left = 0, right = n - 1;

        while(left <= right) {
            int mid = left + (right - left) / 2;

            int papersAtLeast = n - mid; // papers from mid..n-1

            if(citations[mid] >= papersAtLeast) {
                right = mid - 1; // try to include more papers
            }
            else {
                left = mid + 1;
            }
        }

        return n - left;
    }
};
```

### 15. [Max candies to k children](https://leetcode.com/problems/maximum-candies-allocated-to-k-children/description/)

Given `candies[i]` (the size of pile `i`) and an integer `k` children, each pile can be split into any number of pieces. Find the maximum size `x` such that at least `k` children can each receive a piece of size `x`.

```cpp
class Solution {
public:
    long long piecesAt(vector<int>& candies, int size) {
        long long total = 0;
        for(int c : candies) total += c / size;
        return total;
    }

    int maximumCandies(vector<int>& candies, long long k) {
        int left = 1, right = *max_element(candies.begin(), candies.end());
        int ans = 0;

        while(left <= right) {
            int mid = left + (right - left) / 2;

            if(piecesAt(candies, mid) >= k) {
                ans = mid;
                left = mid + 1;
            }
            else {
                right = mid - 1;
            }
        }

        return ans;
    }
};
```

### 16. [Capacity to ship packages in d days](https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/description/)

Given package `weights` (loaded onto the ship in order) and an integer `days`, find the minimum ship capacity such that all packages can be shipped within `days` days.

```cpp
class Solution {
public:
    bool canShip(vector<int>& weights, int days, int capacity) {
        int daysNeeded = 1, currentLoad = 0;

        for(int w : weights) {
            if(currentLoad + w > capacity) {
                daysNeeded++;
                currentLoad = 0;
            }
            currentLoad += w;
        }

        return daysNeeded <= days;
    }

    int shipWithinDays(vector<int>& weights, int days) {
        int left = *max_element(weights.begin(), weights.end());
        int right = accumulate(weights.begin(), weights.end(), 0);

        while(left < right) {
            int mid = left + (right - left) / 2;

            if(canShip(weights, days, mid)) {
                right = mid;
            }
            else {
                left = mid + 1;
            }
        }

        return left;
    }
};
```

### 17. [Book Allocation Problem](https://www.geeksforgeeks.org/problems/allocate-minimum-number-of-pages0937/1)

Given the number of pages in `n` books and an integer number of `students`, allocate contiguous books to each student (every book must be assigned, each student gets at least one book) to **minimize the maximum number of pages** assigned to any student.

```cpp
class Solution {
public:
    bool isFeasible(vector<int>& books, int students, int maxPages) {
        int count = 1, pages = 0;

        for(int p : books) {
            if(p > maxPages) return false; // single book too large to fit any student's limit

            if(pages + p > maxPages) {
                count++;
                pages = p;
            }
            else {
                pages += p;
            }
        }

        return count <= students;
    }

    int findPages(vector<int>& books, int students) {
        if(students > (int)books.size()) return -1;

        int left = *max_element(books.begin(), books.end());
        int right = accumulate(books.begin(), books.end(), 0);

        while(left < right) {
            int mid = left + (right - left) / 2;

            if(isFeasible(books, students, mid)) {
                right = mid;
            }
            else {
                left = mid + 1;
            }
        }

        return left;
    }
};
```

### 18. [Split largest arrray](https://leetcode.com/problems/split-array-largest-sum/description/)

Given an integer array `nums` and an integer `m`, split it into `m` non-empty contiguous subarrays so as to **minimize the largest sum** among the subarrays.

**Intuition**: identical shape to the Book Allocation problem — binary search on the answer (the "largest sum"), and check feasibility greedily.

```cpp
class Solution {
public:
    bool canSplit(vector<int>& nums, int m, int maxSum) {
        int parts = 1, current = 0;

        for(int n : nums) {
            if(current + n > maxSum) {
                parts++;
                current = n;
            }
            else {
                current += n;
            }
        }

        return parts <= m;
    }

    int splitArray(vector<int>& nums, int m) {
        int left = *max_element(nums.begin(), nums.end());
        int right = accumulate(nums.begin(), nums.end(), 0);

        while(left < right) {
            int mid = left + (right - left) / 2;

            if(canSplit(nums, m, mid)) {
                right = mid;
            }
            else {
                left = mid + 1;
            }
        }

        return left;
    }
};
```

### 19. [Search 2 D matrix](https://leetcode.com/problems/search-a-2d-matrix/)

Given an `m x n` matrix where each row is sorted ascending and the first element of each row is greater than the last element of the previous row, determine if a `target` value exists in the matrix.

**Intuition**: the matrix behaves like one flattened sorted array of size `m*n`; binary search on that virtual index space.

```cpp
class Solution {
public:
    bool searchMatrix(vector<vector<int>>& matrix, int target) {
        int m = matrix.size(), n = matrix[0].size();
        int left = 0, right = m * n - 1;

        while(left <= right) {
            int mid = left + (right - left) / 2;
            int val = matrix[mid / n][mid % n];

            if(val == target) return true;
            if(val < target) left = mid + 1;
            else right = mid - 1;
        }

        return false;
    }
};
```

### 20. [Search 2D matrix (Hard)](https://leetcode.com/problems/search-a-2d-matrix-ii/description/)

Given an `m x n` matrix where each row is sorted left-to-right ascending and each column is sorted top-to-bottom ascending (but rows aren't globally chained like problem 19), determine if a `target` exists.

**Intuition**: start at the top-right corner; if the current value is too big, move left (eliminate a column), if too small, move down (eliminate a row).

```cpp
class Solution {
public:
    bool searchMatrix(vector<vector<int>>& matrix, int target) {
        int row = 0, col = matrix[0].size() - 1;

        while(row < (int)matrix.size() && col >= 0) {
            if(matrix[row][col] == target) return true;

            if(matrix[row][col] > target) col--;
            else row++;
        }

        return false;
    }
};
```

### 21. [kth smallest in sorted matrix](https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/description/)

Given an `n x n` matrix where each row and column is sorted ascending, return the `k`th smallest element in the matrix.

**Intuition**: binary search on the *value* range `[matrix[0][0], matrix[n-1][n-1]]`; for a candidate value, count how many entries are `<= mid` using a staircase walk from the bottom-left corner, which runs in O(n).

```cpp
class Solution {
public:
    int countLessEqual(vector<vector<int>>& matrix, int mid) {
        int n = matrix.size();
        int count = 0;
        int row = n - 1, col = 0;

        while(row >= 0 && col < n) {
            if(matrix[row][col] <= mid) {
                count += row + 1; // everything above in this column also qualifies
                col++;
            }
            else {
                row--;
            }
        }

        return count;
    }

    int kthSmallest(vector<vector<int>>& matrix, int k) {
        int n = matrix.size();
        int left = matrix[0][0], right = matrix[n - 1][n - 1];

        while(left < right) {
            int mid = left + (right - left) / 2;

            if(countLessEqual(matrix, mid) < k) {
                left = mid + 1;
            }
            else {
                right = mid;
            }
        }

        return left;
    }
};
```

### 22. [kth smallest in multiplication matrix](https://leetcode.com/problems/kth-smallest-number-in-multiplication-table/description/)

Given an `m x n` multiplication table (where `table[i][j] = i * j`, 1-indexed), return the `k`th smallest value in it.

**Intuition**: same binary-search-on-value approach as the previous problem; for a candidate value, count entries `<= mid` in O(m) by noting row `i` contributes `min(n, mid / i)` qualifying entries.

```cpp
class Solution {
public:
    int countLessEqual(int m, int n, int mid) {
        int count = 0;

        for(int i = 1; i <= m; i++) {
            count += min(n, mid / i);
        }

        return count;
    }

    int findKthNumber(int m, int n, int k) {
        int left = 1, right = m * n;

        while(left < right) {
            int mid = left + (right - left) / 2;

            if(countLessEqual(m, n, mid) < k) {
                left = mid + 1;
            }
            else {
                right = mid;
            }
        }

        return left;
    }
};
```

### 23. [Median of 2 sorted arrays](https://leetcode.com/problems/median-of-two-sorted-arrays/)

<font color="red">**HARD**</font>

Given two sorted arrays `nums1` and `nums2` of sizes `m` and `n`, return the median of the two combined sorted arrays, in O(log(min(m, n))) time.

**Intuition**: binary search a partition point on the smaller array; the mirrored partition on the other array is determined by the combined half-size, and the correct partition is the one where every element on the left side is `<=` every element on the right side.

```cpp
class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        if(nums1.size() > nums2.size()) return findMedianSortedArrays(nums2, nums1);

        int m = nums1.size(), n = nums2.size();
        int total = m + n;
        int half = (total + 1) / 2;

        int left = 0, right = m;

        while(left <= right) {
            int cut1 = left + (right - left) / 2;
            int cut2 = half - cut1;

            int left1 = (cut1 == 0) ? INT_MIN : nums1[cut1 - 1];
            int left2 = (cut2 == 0) ? INT_MIN : nums2[cut2 - 1];
            int right1 = (cut1 == m) ? INT_MAX : nums1[cut1];
            int right2 = (cut2 == n) ? INT_MAX : nums2[cut2];

            if(left1 <= right2 && left2 <= right1) {
                if(total % 2 == 0) {
                    return (max(left1, left2) + min(right1, right2)) / 2.0;
                }
                return max(left1, left2);
            }
            else if(left1 > right2) {
                right = cut1 - 1;
            }
            else {
                left = cut1 + 1;
            }
        }

        return 0.0;
    }
};
```
