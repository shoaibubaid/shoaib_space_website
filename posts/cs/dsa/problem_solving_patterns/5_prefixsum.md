---
title: Problem Patterns - 5. Prefix sum
era: Pattern type 5 
readTime: 10 min read
excerpt: 
floats: bulb.png, cpu.png, gpu.png, keyboard.png, monitor.png, ram.png, star_yellow.png
background: cs/dsa.png
---
# 5. Prefix Sum
### 1. [Subarray Sum Equals K (EASY)](https://leetcode.com/problems/subarray-sum-equals-k/description/)

Given an array of integers `nums` and an integer `k`, return the total number of subarrays whose sum equals to `k`.

A subarray is a contiguous non-empty sequence of elements within an array.

```cpp
class Solution {
public:
    int subarraySum(vector<int>& nums, int k) {
        // sliding window may not work reliabily here because here we can have negative numbers also
        // so we use prefix sum.
        // The technique is : current_sum - prefix_sum = sum_of_the subarray between those 2 indices
        // now for a given current_sum, we need to find a prefix sum such that
        // prefix_sum = current_sum - k;

        int ans = 0;
        unordered_map<int,int>mp;
        int current_sum = 0;

        mp[0] = 1; // because prefix sum = 0 exists even before we start

        for(int i = 0; i < nums.size(); i++){
            current_sum += nums[i];

            if(mp.find(current_sum - k) != mp.end()){
                ans += mp[current_sum - k]; // to cover all those prefixes where prefix_sum = current_sum -k
            }

            mp[current_sum]++;

        }

        return ans;
    }
};
```

### 2. [Find Pivot Index (EASY)](https://leetcode.com/problems/find-pivot-index/description/)

Given an array of integers `nums`, calculate the pivot index of this array.

The pivot index is the index where the sum of all the numbers strictly to the left of the index is equal to the sum of all the numbers strictly to the index's right.

If the index is on the left edge of the array, then the left sum is `0` because there are no elements to the left. This also applies to the right edge of the array.

Return the leftmost pivot index. If no such index exists, return `-1`.

```cpp
// TIME OPTIMISED SOLUTION
class Solution {
public:
    int pivotIndex(vector<int>& nums) {
        int n = nums.size();
        vector<int> prefix_sum(n);
        vector<int> suffix_sum(n);
        int pre_sum = 0;
        int suf_sum = 0;
        for(int i = 0; i < n; i++){
            prefix_sum[i] = pre_sum;
            suffix_sum[n-i-1] = suf_sum;
            pre_sum += nums[i];
            suf_sum += nums[n-i-1];
        }

        for(int i = 0; i < n; i++){
            if(prefix_sum[i] == suffix_sum[i]) return i;
        }
        

        return -1;
    }
};
```
```cpp
// SPACE OPTIMIZED SOLUTION
class Solution {
public:
    int pivotIndex(vector<int>& nums) {
        int total_sum = 0;
        for(int num : nums){
            total_sum += num;
        }

        int prefix_sum = 0;

        for(int i = 0; i < nums.size(); i++){
            int suffix_sum = total_sum - prefix_sum - nums[i];

            if(suffix_sum == prefix_sum) return i;

            prefix_sum += nums[i];
        }

        return -1;
    }
};
```
### 3. [Subarray Sums Divisible By K (Med)](https://leetcode.com/problems/subarray-sums-divisible-by-k/description/)

Given an integer array `nums` and an integer `k`, return the number of non-empty subarrays that have a sum divisible by `k`.

A subarray is a contiguous part of an array.

```cpp
class Solution {
public:
    int subarraysDivByK(vector<int>& nums, int k) {
        // if the remainders of the sums is same, then the difference is divisible by k
        
        unordered_map<int, int> mp;
        mp[0] = 1; // very important step. dont forget this one
        int sum = 0;
        int count = 0;
        for(int num : nums){
            sum += num;

            int rem = sum % k;

            if(rem < 0) rem += k;

            if(mp.find(rem) != mp.end()){
                count += mp[rem];
            }

            mp[rem]++;
        }

        return count;
    }
};
```


### 4. [Contiguous array (MED)](https://leetcode.com/problems/contiguous-array/description/)
### 5. [Problem challenge: Shortest Subarray With Sum at Least K (HARD)](https://leetcode.com/problems/shortest-subarray-with-sum-at-least-k/description/)
### 6. [Problem challenge: Count Range Sum (hard)](https://leetcode.com/problems/count-of-range-sum/description/)