---
title: Problem Patterns - 1. Two pointers approach
era: Pattern type 1
readTime: 10 min read
excerpt: 
floats: bulb.png, cpu.png, gpu.png, keyboard.png, monitor.png, ram.png, star_yellow.png
background: cs/dsa.png
---

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
#### 1. [Pair with Target Sum (easy)](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/description/) 

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

#### 2. [Rearrange 0 and 1](https://www.geeksforgeeks.org/problems/segregate-0s-and-1s5106/1)

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
#### 3. [Remove Duplicates (easy)](https://leetcode.com/problems/remove-duplicates-from-sorted-list/)

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

#### 4. [Squaring a Sorted Array (easy)](https://leetcode.com/problems/squares-of-a-sorted-array/)

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
#### 5. [Triplet Sum to Zero (medium)](https://leetcode.com/problems/3sum/)

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

#### 6. [Triplet Sum Close to Target (medium)](https://leetcode.com/problems/3sum-closest/)

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
#### 7. [Triplets with Smaller Sum (medium)](https://www.geeksforgeeks.org/problems/count-triplets-with-sum-smaller-than-x5549/1)

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
#### 8. [Subarrays with Product Less than a Target (medium)](https://leetcode.com/problems/subarray-product-less-than-k/)

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

#### 9. [Dutch National Flag Problem (medium)](https://leetcode.com/problems/sort-colors/description/)

You are given an array `nums` with `n` objects colored red, white, or blue, sort them **in-place** so that objects of the same color are adjacent, with the colors in the order red, white, and blue.

We will use the integers 0, 1, and 2 to represent the color red, white, and blue, respectively.

You must solve this problem without using the library's sort function.

```cpp
// Approach 1
class Solution {
public:
    void sortColors(vector<int>& nums) {
        int count0 = 0;
        int count1 = 0;
        int count2 = 0;
        for (int i = 0; i < nums.size(); i++) {
            if (nums[i] == 0)
                count0++;
            if (nums[i] == 1)
                count1++;
            if (nums[i] == 2)
                count2++;
        }

        for (int i = 0; i < count0; i++) {
            nums[i] = 0;
        }

        for (int i = count0; i < count0 + count1; i++) {
            nums[i] = 1;
        }

        for (int i = count0 + count1; i < count0 + count1 + count2; i++) {
            nums[i] = 2;
        }
    }
};
```

```cpp
// Optimum approach
class Solution {
public:
    void sortColors(vector<int>& nums) {
        /* Assume that there is an array that has 3 pointers
        From 0 to low - 1: 0s
        From low to mid  : 1s
        From mid to high : Unsorted
        From high to n-1 : 2s

        Now think that the unsorted array is this one and start
        We just need to sort from mid to high
        */

        int low = 0;
        int mid = 0;
        int high = nums.size() - 1;

        while (mid <= high) {
            if (nums[mid] == 0) {
                swap(nums[low], nums[mid]);
                low++;
                mid++;
            }

            else if (nums[mid] == 1) {
                mid++;
            }

            else{
                swap(nums[high], nums[mid]);
                high--;
            }
        }
    }
};
```
#### 10. [Problem Challenge 1: Quadruple Sum to Target (medium)](https://leetcode.com/problems/4sum/)
#### 11. [Problem Challenge 2: Comparing Strings containing Backspaces (medium)](https://leetcode.com/problems/backspace-string-compare/)
#### 12. [Problem Challenge 3: Minimum Window Sort (medium)](https://leetcode.com/problems/shortest-unsorted-continuous-subarray/)
