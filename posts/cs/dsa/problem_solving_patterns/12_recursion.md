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
### 2. [Check if string is Pallindrome](https://www.geeksforgeeks.org/problems/palindrome-string0817/1)
### 3. [Check if Array is Sorted](https://www.geeksforgeeks.org/problems/check-if-an-array-is-sorted0701/1)
### 4. [Sum of digits of a number](https://www.geeksforgeeks.org/problems/sum-of-digits1742/1)
### 5. [Remove occurences of a character in string](https://www.geeksforgeeks.org/problems/remove-all-occurrences-of-a-character-in-a-string/1)
### 6. [Generate parenthesis](https://leetcode.com/problems/generate-parentheses/description/)
### 7. [Letter Combinations of phone number](https://leetcode.com/problems/letter-combinations-of-a-phone-number/description/)
### 8. [Permutations](https://leetcode.com/problems/permutations/description/)
### 9. [Combination Sum](https://leetcode.com/problems/combination-sum/description/)
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

