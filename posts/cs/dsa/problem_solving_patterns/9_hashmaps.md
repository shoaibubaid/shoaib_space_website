---
title: Problem Patterns - 9. Hash Maps
era: Pattern type 9 
readTime: 10 min read
excerpt: 
floats: bulb.png, cpu.png, gpu.png, keyboard.png, monitor.png, ram.png, star_yellow.png
background: cs/dsa.png
---

# 9. Hash Maps
## 1. [First Non-repeating Character (easy)](https://leetcode.com/problems/first-unique-character-in-a-string/)

Given a string `s`, find the first non-repeating character in it and return its index. If it does not exist, return `-1`

```cpp
class Solution {
public:
    int firstUniqChar(string s) {
        unordered_map<char, int> mp;

        for (char c : s) {
            mp[c]++;
        }

        for (int i = 0; i < s.size(); i++) {
            if (mp[s[i]] == 1) {
                return i;
            }
        }

        return -1;
    }
};
```



## 2. [Maximum Number of Balloons (easy)](https://leetcode.com/problems/maximum-number-of-balloons/)
## 3. [Longest Palindrome(easy)](https://leetcode.com/problems/longest-palindrome/)
## 4. [Ransom Note (easy)](https://leetcode.com/problems/ransom-note/)