---
title: Problem Patterns - 7. In-place Reversal of a LinkedList
era: Pattern type 7 
readTime: 10 min read
excerpt: 
floats: bulb.png, cpu.png, gpu.png, keyboard.png, monitor.png, ram.png, star_yellow.png
background: cs/dsa.png
---

# 7. LinkedList Reversal (in-place)
## 1. [Reverse a LinkedList (easy)](https://leetcode.com/problems/reverse-linked-list/)

Given the `head` of a singly linked list, reverse the list, and return the reversed list.

```cpp
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
    ListNode* reverseList(ListNode* head) {

        if (head == NULL || head->next == nullptr)
            return head;
        ListNode* temp = head;
        ListNode* prev = nullptr;

        while (temp != nullptr) {
            ListNode* next = temp->next;
            temp->next = prev;
            prev = temp;
            temp = next;
        }

        return prev;
    }
};
```
## 2. [Reverse a Sub-list (medium)](https://leetcode.com/problems/reverse-linked-list-ii/)
## 3. [Reverse List in Pairs (Medium)](https://leetcode.com/problems/swap-nodes-in-pairs/description/)
## 4. [Reverse every K-element Sub-list (HARD)](https://leetcode.com/problems/reverse-nodes-in-k-group/)
## 5. [Problem Challenge 1: Reverse nodes in EVEN Length Groups (HARD)](https://leetcode.com/problems/reverse-nodes-in-even-length-groups/description/)
## 6. [Problem Challenge 2: Rotate a LinkedList (medium)](https://leetcode.com/problems/rotate-list/)