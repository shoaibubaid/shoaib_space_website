---
title: Problem Patterns - 8. Stack
era: Pattern type 8 
readTime: 10 min read
excerpt: 
floats: bulb.png, cpu.png, gpu.png, keyboard.png, monitor.png, ram.png, star_yellow.png
background: cs/dsa.png
---

# 8. Stack
## 1. [Remove adjacent duplicates](https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string/description/)

You are given a string `s` consisting of lowercase English letters. A duplicate removal consists of choosing two adjacent and equal letters and removing them.

We repeatedly make duplicate removals on `s` until we no longer can.

Return the final string after all such duplicate removals have been made. It can be proven that the answer is unique.

```cpp
class Solution {
public:
    string removeDuplicates(string s) {
        string st;

        for (char c : s) {
            if (!st.empty() && st.back() == c) {
                st.pop_back();
            }
            else {
                st.push_back(c);
            }
        }

        return st;
    }
};
```

## 2. [Balanced Parentheses](https://leetcode.com/problems/valid-parentheses/description/)
## 3. [Reverse a String](https://www.geeksforgeeks.org/problems/reverse-a-string/1)
## 4. [Next Greater Element (easy)](https://leetcode.com/problems/next-greater-element-ii/description/)
## 5. [Daily Temperatures (easy)](https://leetcode.com/problems/daily-temperatures/)
## 6. [Remove Nodes From Linked List (easy)](https://leetcode.com/problems/remove-nodes-from-linked-list/)
## 7. [Remove All Adjacent Duplicates in String II (medium)](https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string-ii/)
## 8. [Simplify Path (Problem Challenge)](https://leetcode.com/problems/simplify-path/)
## 9. [Remove K Digits (hard) Problem challenge](https://leetcode.com/problems/remove-k-digits/)