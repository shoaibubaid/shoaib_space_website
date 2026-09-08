---
title: Problem Patterns - 3 Sliding Window
era: Pattern type 3 
readTime: 10 min read
excerpt: 
floats: bulb.png, cpu.png, gpu.png, keyboard.png, monitor.png, ram.png, star_yellow.png
background: cs/dsa.png
---

## 3. Sliding Window

[Sliding window Introduction Geeks for Geeks](https://www.geeksforgeeks.org/dsa/window-sliding-technique/)

#### How to Identify Sliding Window Problems?
- These problems generally require Finding Maximum/Minimum **Subarray, Substrings** which satisfy some specific condition.
- The size of the subarray or substring ‘k’ will be given in some of the problems.
- These problems can easily be solved in O(n2) time complexity using nested loops, using sliding window we can solve these in O(n) Time Complexity.
- Required Time Complexity: O(n) or O(n log n)
- Constraints: n <= 10^6

#### 1. [Maximum Sum Subarray of Size K (easy)](https://www.geeksforgeeks.org/problems/max-sum-subarray-of-size-k5313/1)

Given an array of integers `arr[]`  and a number `k`. Return the **maximum sum** of a subarray of size `k`.

Note: A subarray is a contiguous part of any given array.



```cpp
class Solution {
  public:
    int maxSubarraySum(vector<int>& arr, int k) {
        // code here
        int max_sum = 0;
        int current_sum = 0;
        int n = arr.size();
        for(int i = 0; i < k; i++){
            max_sum+= arr[i];
        }
        
        current_sum = max_sum;
        
        for(int i = 0; i < n-k; i++){
            current_sum = current_sum + arr[k+i]-arr[i];
            max_sum = std::max(max_sum, current_sum);
        }
        return max_sum;
    }
};
```
#### 2. [Smallest Subarray with a given sum (easy)](https://leetcode.com/problems/minimum-size-subarray-sum/)

Given an array of positive integers `nums` and a positive integer `target`, return the **minimal length** of a *subarray* whose sum is greater than or equal to `target`. If there is no such subarray, return `0` instead.

 
```cpp
class Solution {
public:
    int minSubArrayLen(int target, vector<int>& nums) {
        // specialized two pointer approach is sliding window

        int left = 0;
        int right = 0;
        int sum = 0;
        int min_length = INT_MAX;

        while(right < nums.size()){
            sum += nums[right];
            while(sum >= target){
                min_length = min(min_length, right-left+1);
                sum -= nums[left++];
            }
            right++;
        }

        return min_length == INT_MAX ? 0 : min_length;
    }
};
```
#### 3. [Longest Substring with K Distinct Characters (medium)](https://www.geeksforgeeks.org/problems/longest-k-unique-characters-substring0853/1)

You are given a string `s` consisting only lowercase alphabets and an integer `k`. Your task is to find the length of the **longest substring** that contains exactly `k` distinct characters.

*GOOD QUESTION DO ONCE AGAIN AND REVISE PROPERLY*
```cpp
class Solution {
	public:
	int longestKSubstr(string &s, int k) {
		int left = 0;
		int right = 0;
		unordered_map<char, int> mp;
		int distinct = 0;
		int max_length = -1;

        for (right = 0; right < s.size(); right++) {
			if (mp[s[right]] == 0) {
				distinct++;
			}
			mp[s[right]]++;
			
			while (distinct > k) {
				mp[s[left]]--;
		
                if (mp[s[left]] == 0) {
					distinct--;
				}
				left++;
			}
			
			if (distinct == k) {
				max_length = max(max_length, right - left + 1);
			}
			
		}
		return max_length;
		
	}
};
```



#### 4. [Fruits into Baskets (medium)](https://leetcode.com/problems/fruit-into-baskets/)

You are visiting a farm that has a single row of fruit trees arranged from left to right. The trees are represented by an integer array `fruits` where `fruits[i]` is the type of fruit the `ith` tree produces.

You want to collect as much fruit as possible. However, the owner has some strict rules that you must follow:

- You only have two baskets, and each basket can only hold a single type of fruit. There is no limit on the amount of fruit each basket can hold.
- Starting from any tree of your choice, you must pick exactly one fruit from every tree (including the start tree) while moving to the right. The picked fruits must fit in one of your baskets.
- Once you reach a tree with fruit that cannot fit in your baskets, you must stop.

Given the integer array `fruits`, return the **maximum** number of fruits you can pick.

```cpp
class Solution {
public:
    int totalFruit(vector<int>& fruits) {
        // this is basically largest substring with k unique characters

        int left = 0;
        int max_length = 1;
        unordered_map<int, int> mp;
        int distinct = 0;

        for(int right = 0; right < fruits.size(); right++){
            if(mp[fruits[right]] == 0){
                distinct++;
            }
            mp[fruits[right]]++;

            while(distinct > 2){
                mp[fruits[left]]--;
                if(mp[fruits[left]] == 0){
                    distinct--;
                }
                left++;
            }

            max_length = max(max_length, right-left+1);
        }
        return max_length;
    }
};
```

#### 5. [No-repeat Substring (hard)](https://leetcode.com/problems/longest-substring-without-repeating-characters/description/)

Given a string `s`, find the length of the **longest substring** without duplicate characters.

```cpp
class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        int left = 0;
        int max_length = 0;
        unordered_map<int, int> mp;

        for(int right = 0; right < s.size(); right++){
            mp[s[right]]++;

            while(mp[s[right]] > 1){
                mp[s[left]]--;
                left++;
            }

            max_length = max(max_length, right - left + 1);
        }
        return max_length;

    }
};
```



#### 6. [Longest Substring with Same Letters after Replacement (hard)](https://leetcode.com/problems/longest-repeating-character-replacement/)

You are given a string `s` and an integer `k`. You can choose any character of the string and change it to any other uppercase English character. You can perform this operation at most `k` times.

Return the length of the longest substring containing the same letter you can get after performing the above operations.

```cpp
class Solution {
public:
    int characterReplacement(string s, int k) {
        int left = 0;
        int max_length = 0;
        int max_freq = 0;
        unordered_map<char,int> mp;

        for(int right = 0; right < s.size(); right++){
            mp[s[right]]++;

            max_freq = max(max_freq, mp[s[right]]);

            while((right - left + 1) - max_freq > k){
                mp[s[left]]--;
                left++;
            }

            max_length = max(max_length, right-left+1);
        }

        return max_length;
    }
};
```
#### 7. [Longest Subarray with Ones after Replacement (hard)](https://leetcode.com/problems/max-consecutive-ones-iii/)
#### 8. [Minimum size subarray SUM](https://leetcode.com/problems/minimum-size-subarray-sum/description/)
#### 9. [Minimum Size Substring (HARD)](https://leetcode.com/problems/minimum-window-substring/description/?envType=study-plan-v2&envId=top-interview-150)
#### 10. [Problem Challenge 1: Permutation in a String (hard)](https://leetcode.com/problems/permutation-in-string/)
#### 11. [Problem Challenge 2: String Anagrams (hard)](https://leetcode.com/problems/find-all-anagrams-in-a-string/)
#### 12. [Problem Challenge 4: Words Concatenation (hard)](https://leetcode.com/problems/substring-with-concatenation-of-all-words/)