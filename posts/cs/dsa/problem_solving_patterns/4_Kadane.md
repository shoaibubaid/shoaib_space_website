---
title: Problem Patterns - 4. Kadane Pattern
era: Pattern type 4 
readTime: 10 min read
excerpt: 
floats: bulb.png, cpu.png, gpu.png, keyboard.png, monitor.png, ram.png, star_yellow.png
background: cs/dsa.png
---

# 4. Kadane Pattern
## 1. [Maximum subarray sum](https://leetcode.com/problems/maximum-subarray/?utm_source=chatgpt.com)

Given an integer array `nums`, find the *subarray* with the **largest sum**, and return its *sum*.
```cpp
class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int sum = 0;
        int max_sum = INT_MIN;

        for(int right = 0; right < nums.size(); right++){
            sum += nums[right];
            max_sum = max(max_sum, sum);

            if(sum < 0){
                sum = 0;
            }
        }

        return max_sum;
    }
};
```
## 2. [Minimum Subarray Sum](https://www.geeksforgeeks.org/problems/smallest-sum-contiguous-subarray/1)

Given an array `arr[]`, find the sub-array containing at least one number which has the minimum sum and return its sum.
```cpp
class Solution {
  public:
    int minSubarraySum(vector<int> &arr) {
        // code here
        int sum  = 0;
        int min_sum = INT_MAX;
        
        for(int right = 0; right < arr.size(); right++){
            sum += arr[right];
            min_sum = min(min_sum, sum);
            
            if(sum > 0){
                sum = 0;
            }
        }
        return min_sum;
    }
};
```
## 3. [Maximum product subarray](https://leetcode.com/problems/maximum-product-subarray/?utm_source=chatgpt.com)

Given an integer array `nums`, find a subarray that has the largest product, and return the product.

The test cases are generated so that the answer will fit in a 32-bit integer.

Note that the product of an array with a single element is the value of that element.

```cpp
class Solution {
public:
    int maxProduct(vector<int>& nums) {
        // The trick is to have both the minimum and maximum at each point

        int current_max = nums[0];
        int current_min = nums[0];
        int max_product = nums[0];

        for(int i = 1; i < nums.size(); i++){
            
            int x = nums[i];

            int temp = current_max;

            current_max = max({x, x*current_max, x*current_min});
            current_min = min({x, x*temp, x*current_min});

            max_product = max(max_product, current_max);
        }

        return max_product;
    }
};
```

## 4. [Maximum subarray sum with one deletion](https://leetcode.com/problems/maximum-subarray-sum-with-one-deletion/description/)

Given an array of integers, return the maximum sum for a non-empty subarray (contiguous elements) with at most one element deletion. In other words, you want to choose a subarray and optionally delete one element from it so that there is still at least one element left and the sum of the remaining elements is maximum possible.

Note that the subarray needs to be non-empty after deleting one element.
```cpp
class Solution {
public:
    int maximumSum(vector<int>& arr) {
        int sum_without_deletion = arr[0];
        int sum_after_deletion = arr[0];
        int ans = arr[0];

        for(int i = 1; i < arr.size(); i++){

            int prev_nodelete = sum_without_deletion;
            int prev_onedelete = sum_after_deletion;

            sum_without_deletion = max(arr[i], prev_nodelete + arr[i]);
            sum_after_deletion = max(prev_nodelete, prev_onedelete + arr[i]);

            ans = max(ans, max(sum_without_deletion, sum_after_deletion));
        }

        return ans;
    }
};
```


## 5. [Maximum absolute sum of any subarray](https://leetcode.com/problems/maximum-absolute-sum-of-any-subarray/)
## 6. [Maximum sum in circular array variant](https://leetcode.com/problems/maximum-sum-circular-subarray/?utm_source=chatgpt.com)