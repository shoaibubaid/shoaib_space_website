---
title: Problem Patterns - 12. Recursion and Backtracking
era: Pattern type 12 
readTime: 10 min read
excerpt: 
floats: bulb.png, cpu.png, gpu.png, keyboard.png, monitor.png, ram.png, star_yellow.png
background: cs/dsa.png
---
# 12. Recursion and Backtracking
### 1. [Fibonnaci](https://leetcode.com/problems/fibonacci-number/description/)

Given `n`, return the `n`th Fibonacci number, defined by `F(0) = 0`, `F(1) = 1`, and `F(n) = F(n-1) + F(n-2)`.

```cpp
class Solution {
public:
    int fib(int n) {
        if(n < 2) return n;
        return fib(n - 1) + fib(n - 2);
    }
};
```

### 2. [Check if string is Pallindrome](https://www.geeksforgeeks.org/problems/palindrome-string0817/1)

Given a string `s`, check recursively whether it reads the same forwards and backwards.

```cpp
class Solution {
public:
    bool solve(string& s, int left, int right) {
        if(left >= right) return true;
        if(s[left] != s[right]) return false;

        return solve(s, left + 1, right - 1);
    }

    bool isPalindrome(string s) {
        return solve(s, 0, s.size() - 1);
    }
};
```

### 3. [Check if Array is Sorted](https://www.geeksforgeeks.org/problems/check-if-an-array-is-sorted0701/1)

Given an array of `n` integers, check recursively whether it is sorted in non-decreasing order.

```cpp
class Solution {
public:
    bool arraySortedOrNot(vector<int>& arr, int n) {
        if(n <= 1) return true;

        if(arr[n - 1] < arr[n - 2]) return false;

        return arraySortedOrNot(arr, n - 1);
    }
};
```

### 4. [Sum of digits of a number](https://www.geeksforgeeks.org/problems/sum-of-digits1742/1)

Given a non-negative integer `n`, recursively compute the sum of its digits.

```cpp
class Solution {
public:
    int sumOfDigits(int n) {
        if(n == 0) return 0;

        return n % 10 + sumOfDigits(n / 10);
    }
};
```

### 5. [Remove occurences of a character in string](https://www.geeksforgeeks.org/problems/remove-all-occurrences-of-a-character-in-a-string/1)

Given a string `s` and a character `ch`, recursively remove every occurrence of `ch` from `s` and return the result.
```cpp
class Solution {
  public:
  
    string removehelper(string &s, int curr, int size, char c){
        if(curr >= size) return s;
        
        if(s[curr] == c){
            s = s.substr(0, curr) + s.substr(curr + 1);
            return removehelper(s, curr, s.size(), c);
        }
        
        return removehelper(s, curr + 1, s.size(), c);
    }
  
    // Function to remove all occurrences of the character from the string
    void removeCharacter(string &s, char c) {
        // code here
        removehelper(s, 0, s.size(), c);
        
    }
};
```
```cpp
class Solution {
public:
    void solve(string& s, char ch, int idx) {
        if(idx == (int)s.size()) return;

        if(s[idx] == ch) {
            s.erase(idx, 1);
            solve(s, ch, idx); // stay at idx, next char has shifted into it
        }
        else {
            solve(s, ch, idx + 1);
        }
    }

    string removeOccurrence(string s, char ch) {
        solve(s, ch, 0);
        return s;
    }
};
```

### 6. [Generate parenthesis](https://leetcode.com/problems/generate-parentheses/description/)

Given `n` pairs of parentheses, generate all combinations of well-formed (balanced) parentheses.

**Intuition**: only add `'('` if fewer than `n` have been used, and only add `')'` if it wouldn't outnumber the `'('`s placed so far.

```cpp
class Solution {
public:
    void solve(int open, int close, int n, string& current, vector<string>& ans) {
        if((int)current.size() == 2 * n) {
            ans.push_back(current);
            return;
        }

        if(open < n) {
            current.push_back('(');
            solve(open + 1, close, n, current, ans);
            current.pop_back();
        }

        if(close < open) {
            current.push_back(')');
            solve(open, close + 1, n, current, ans);
            current.pop_back();
        }
    }

    vector<string> generateParenthesis(int n) {
        vector<string> ans;
        string current;
        solve(0, 0, n, current, ans);
        return ans;
    }
};
```

### 7. [Letter Combinations of phone number](https://leetcode.com/problems/letter-combinations-of-a-phone-number/description/)

Given a string `digits` containing digits `2-9`, return all possible letter combinations the number could represent, using the standard telephone-keypad letter mapping.

```cpp
class Solution {
public:
    vector<string> mapping = {"", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"};

    void solve(int idx, string& digits, string& current, vector<string>& ans) {
        if(idx == (int)digits.size()) {
            ans.push_back(current);
            return;
        }

        string letters = mapping[digits[idx] - '0'];

        for(char ch : letters) {
            current.push_back(ch);
            solve(idx + 1, digits, current, ans);
            current.pop_back();
        }
    }

    vector<string> letterCombinations(string digits) {
        vector<string> ans;
        if(digits.empty()) return ans;

        string current;
        solve(0, digits, current, ans);
        return ans;
    }
};
```

### 8. [Permutations](https://leetcode.com/problems/permutations/description/)

Given an array `nums` of distinct integers, return all possible permutations, in any order.

```cpp
class Solution {
public:
    void solve(vector<int>& nums,vector<int>& curr, vector<vector<int>>& ans){

        int n = nums.size();
        if(nums.empty()){
            ans.push_back(curr);
            return;
        }
        for(int i = 0; i < n ; i++){
            int value = nums[i];
            curr.push_back(value);
            nums.erase(nums.begin() + i);
            solve(nums, curr, ans);
            nums.insert(nums.begin() + i, value);
            curr.pop_back();
        } 
    }

    vector<vector<int>> permute(vector<int>& nums) {
        vector<vector<int>> ans;
        vector<int> curr;
        solve(nums, curr, ans);

        return ans;
    }
};
```
```cpp
class Solution {
public:
    void solve(vector<int>& nums, vector<bool>& used, vector<int>& current, vector<vector<int>>& ans) {
        if(current.size() == nums.size()) {
            ans.push_back(current);
            return;
        }

        for(int i = 0; i < nums.size(); i++) {
            if(used[i]) continue;

            used[i] = true;
            current.push_back(nums[i]);

            solve(nums, used, current, ans);

            current.pop_back();
            used[i] = false;
        }
    }

    vector<vector<int>> permute(vector<int>& nums) {
        vector<vector<int>> ans;
        vector<int> current;
        vector<bool> used(nums.size(), false);

        solve(nums, used, current, ans);
        return ans;
    }
};
```

### 9. [Combination Sum](https://leetcode.com/problems/combination-sum/description/)

Given an array of distinct integers `candidates` and a target integer `target`, return all unique combinations where the chosen numbers sum to `target`. The same number may be chosen an unlimited number of times.

**Intuition**: at each index, branch into "take this candidate again" (stay at the same index) versus "move on to the next candidate".

```cpp
class Solution {
public:
    void solve(vector<int>& candidates, int idx, int remaining, vector<int>& current, vector<vector<int>>& ans) {
        if(remaining == 0) {
            ans.push_back(current);
            return;
        }
        if(idx == (int)candidates.size() || remaining < 0) return;

        // take candidates[idx] again
        current.push_back(candidates[idx]);
        solve(candidates, idx, remaining - candidates[idx], current, ans);
        current.pop_back();

        // move on without taking it
        solve(candidates, idx + 1, remaining, current, ans);
    }

    vector<vector<int>> combinationSum(vector<int>& candidates, int target) {
        vector<vector<int>> ans;
        vector<int> current;
        solve(candidates, 0, target, current, ans);
        return ans;
    }
};
```

### 10. [Pallindrome partition](https://leetcode.com/problems/palindrome-partitioning/description/)

Given a string `s`, partition `s` such that every substring of the partition is a **palindrome**. Return all possible palindrome partitioning of `s`.

```cpp
class Solution {
public:
    bool isPalindrome(string& s, int start, int end) {
        int left = start;
        int right = end;

        while (left <= right) {
            if (s[left] != s[right])
                return false;
            left++;
            right--;
        }

        return true;
    }

    void solve(string& s, int start, vector<string> &current,
               vector<vector<string>> &ans) {
        if (start == s.size()) {
            ans.push_back(current);
        }

        for (int end = start; end < s.size(); end++) {
            if (isPalindrome(s, start, end)) {

                // add in the current array (that stores ans[i])
                current.push_back(s.substr(start, end - start + 1));

                // go to next letter and explore
                solve(s, end + 1, current, ans);

                // pop them so that it remains empty for the next iteration from the start
                current.pop_back();
            }
        }
    }

    vector<vector<string>> partition(string s) {
        vector<vector<string>> ans;
        vector<string> current;
        solve(s, 0, current, ans);
        return ans;
    }
};
```
