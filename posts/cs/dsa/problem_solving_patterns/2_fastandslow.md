---
title: Problem Patterns - 2. Fast and Slow pointers
era: Pattern type 2 
readTime: 10 min read
excerpt: 
floats: bulb.png, cpu.png, gpu.png, keyboard.png, monitor.png, ram.png, star_yellow.png
background: cs/dsa.png
---

## 2. Fast and Slow Pointers

1. [Middle of the LinkedList (easy)](https://leetcode.com/problems/middle-of-the-linked-list/)

Given the `head` of a singly linked list, return the middle node of the linked list.

If there are two middle nodes, return the second middle node.

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
    ListNode* middleNode(ListNode* head) {
        if(head->next == nullptr){
            return head;
        }
        ListNode *slow = head;
        ListNode *fast = head;

        while(fast != nullptr && fast->next != nullptr){
            slow = slow->next;
            fast = fast->next->next;
        }
        return slow;
    }
};
```

2. [LinkedList Cycle (easy)](https://leetcode.com/problems/linked-list-cycle/)


Given `head`, the head of a linked list, determine if the linked list has a cycle in it.

There is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the `next` pointer. Internally, `pos` is used to denote the index of the node that tail's `next` pointer is connected to. Note that `pos` is not passed as a parameter.

Return `true` if there is a cycle in the linked list. Otherwise, return `false`.

```cpp
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode(int x) : val(x), next(NULL) {}
 * };
 */

 // This is the standard Floyd's Cycle Detection algorithm
class Solution {
public:
    bool hasCycle(ListNode* head) {

        if (head == NULL || head->next == nullptr) {
            return false;
        }

        ListNode* slow = head;
        ListNode* fast = head;

        while (fast != nullptr && fast->next != nullptr) {

            slow = slow->next;
            fast = fast->next->next;

            if (fast == slow) {
                return true;
            }
        }

        return false;
    }
};
```
3. [Start of LinkedList Cycle (medium)](https://leetcode.com/problems/linked-list-cycle-ii/)

Given the `head` of a linked list, return the `node` where the cycle begins. If there is no cycle, return `null`.

There is a cycle in a linked list if there is some node in the list that can be reached again by continuously following the `next` pointer. Internally, `pos` is used to denote the index of the node that tail's next pointer is connected to (0-indexed). It is -1 if there is no cycle. 

Do not modify the linked list.


**solution**
1. Hashmap technique, where we mark the nodes that we have touched
2. Optimised
- move slow and fast till cycle is detected
- if cycle is there, place one at the head and make each of them move one step

```cpp
/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode(int x) : val(x), next(NULL) {}
 * };
 */
class Solution {
public:
    ListNode* detectCycle(ListNode* head) {

        if (head == NULL || head->next == nullptr)
            return NULL;

        ListNode* fast = head;
        ListNode* slow = head;

        while (fast != nullptr && fast->next != nullptr) {
            fast = fast->next->next;
            slow = slow->next;

            if (fast == slow) {
                slow = head;

                while (fast != slow) {
                    slow = slow->next;
                    fast = fast->next;
                }
                return slow;
            }
        }
        return NULL;
    }
};
```
4. [Happy Number (medium)](https://leetcode.com/problems/happy-number/)


Write an algorithm to determine if a number `n` is happy.

A **happy number** is a number defined by the following process:

- Starting with any positive integer, replace the number by the sum of the squares of its digits.
- Repeat the process until the number equals 1 (where it will stay), or it loops endlessly in a cycle which does not include 1.
- Those numbers for which this process ends in 1 are happy.

Return `true` if `n` is a happy number, and `false` if not.

*If you check the question properly, it is about detecting a loop in a linked list*

```cpp
// The commented code is one version which is correct but slower.
class Solution {
public:
    bool isHappy(int n) {
        unordered_map<int, int> mp;
        
        int num = n; 
        while (num != 1) {
            // vector<int> digits;
            int square_sum = 0;

            if (mp.find(num) != mp.end()) {
                return false;
            }
            mp[num] = 1;

            while (num > 0) {
                int digit = num % 10;
                // digits.push_back(digit * digit);
                square_sum += digit*digit;
                num /= 10;
            }

            // for (int i = 0; i < digits.size(); i++) {
            //     square_sum += digits[i];
            // }
            num = square_sum;
        }
        return true;
    }
};
```
5. [FIND DUPLICATE NUMBER](https://leetcode.com/problems/find-the-duplicate-number/description/)

Given an array of integers `nums` containing `n + 1` integers where each integer is in the range `[1, n]` inclusive.

There is only one repeated number in `nums`, return this repeated number.

You must solve the problem without modifying the array `nums` and using only constant extra space.

```cpp
// NOT OPTIMAL O(n^2) time complexity

class Solution {
public:
    int findDuplicate(vector<int>& nums) {
        for(int i = 0; i < nums.size() - 1;i++){
            for(int j = i + 1; j < nums.size(); j++){
                if(nums[i] == nums[j]) return nums[i];
            }
        }
        return -1;
    }
};

// NOT OPTIMAL : O(n) space solution 

class Solution {
public:
    int findDuplicate(vector<int>& nums) {
        vector<int> mp(nums.size());
        for(int i = 0; i < nums.size(); i++){
            if(mp[nums[i]] == 1){
                return nums[i];
            }
            mp[nums[i]] = 1;
        }
        return -1;
    }
};
```

This is an excellent problem where you see the problem from a different approach. see how we can convert this problem into cycle finding problem.

![approach](../pictures/fast_and_slow_pattern_q5.pdf)
```cpp
// OPTIMAL SOLUTION
class Solution {
public:
    int findDuplicate(vector<int>& nums) {
        int slow = 0,fast = 0;

        do{
            slow = nums[slow];
            fast = nums[nums[fast]];
        }while(slow != fast);


        slow = 0;
        while(slow != fast){
            fast = nums[fast];
            slow = nums[slow];
        }

        return slow;
        

    }
};

```


6. [Problem Challenge 1: Palindrome LinkedList (medium)](https://leetcode.com/problems/palindrome-linked-list/)
7. [Problem Challenge 2: Rearrange a LinkedList (medium)](https://leetcode.com/problems/reorder-list/)
8. [Problem Challenge 3: Cycle in a Circular Array (hard)](https://leetcode.com/problems/circular-array-loop/)