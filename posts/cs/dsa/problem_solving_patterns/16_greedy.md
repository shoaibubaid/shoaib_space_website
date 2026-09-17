---
title: Problem Patterns - 16. Greedy Pattern
era: Pattern type 16 
readTime: 10 min read
excerpt: 
floats: bulb.png, cpu.png, gpu.png, keyboard.png, monitor.png, ram.png, star_yellow.png
background: cs/dsa.png
---
# 16. Greedy
### 1. [Lemonade](https://leetcode.com/problems/lemonade-change/)

At a lemonade stand, each drink costs `$5`. Customers pay with a `$5`, `$10`, or `$20` bill, one at a time, and you must give correct change from bills you're currently holding. You start with no change. Return `true` if you can provide correct change to every customer in order, else `false`.

**Intuition**: only track counts of `$5` and `$10` bills — a `$20` can always be broken down into either one `$10` + one `$5`, or three `$5`s, and preferring the former conserves more flexible `$5`s.

```cpp
class Solution {
public:
    bool lemonadeChange(vector<int>& bills) {
        int five = 0, ten = 0;

        for(int bill : bills) {
            if(bill == 5) {
                five++;
            }
            else if(bill == 10) {
                if(five == 0) return false;
                five--;
                ten++;
            }
            else { // bill == 20
                if(ten > 0 && five > 0) {
                    ten--;
                    five--;
                }
                else if(five >= 3) {
                    five -= 3;
                }
                else {
                    return false;
                }
            }
        }

        return true;
    }
};
```

### 2. [Jump Game](https://leetcode.com/problems/jump-game/description/)

Given an array `nums` where `nums[i]` is the maximum jump length from index `i`, starting at index `0`, determine whether you can reach the last index.

**Intuition**: greedily track the farthest index reachable so far; if the current index ever exceeds that reach, you're stuck.

```cpp
class Solution {
public:
    bool canJump(vector<int>& nums) {
        int reach = 0;

        for(int i = 0; i < nums.size(); i++) {
            if(i > reach) return false;

            reach = max(reach, i + nums[i]);
        }

        return true;
    }
};
```

### 3. [Assign cookies](https://leetcode.com/problems/assign-cookies/description/)

Each child `i` has a greed factor `g[i]` (the minimum cookie size that will content them), and each cookie `j` has a size `s[j]`. A cookie can satisfy a child only if its size is `>= g[i]`, and each child gets at most one cookie. Maximize the number of content children.

**Intuition**: sort both arrays; greedily give the smallest cookie that can satisfy the least-greedy remaining child.

```cpp
class Solution {
public:
    int findContentChildren(vector<int>& g, vector<int>& s) {
        sort(g.begin(), g.end());
        sort(s.begin(), s.end());

        int child = 0, cookie = 0;

        while(child < g.size() && cookie < s.size()) {
            if(s[cookie] >= g[child]) {
                child++;
            }
            cookie++;
        }

        return child;
    }
};
```

### 4. [Fractional Knapsack](https://www.geeksforgeeks.org/problems/fractional-knapsack-1587115620/1)

Given the weights and values of `n` items and a knapsack of capacity `W`, maximize the total value you can carry. Unlike 0/1 knapsack, you may take a **fraction** of an item.

**Intuition**: since items can be split, always prefer the item with the highest value-per-unit-weight first.

```cpp
class Solution {
public:
    double fractionalKnapsack(vector<int>& val, vector<int>& wt, int W) {
        int n = val.size();
        vector<int> idx(n);
        for(int i = 0; i < n; i++) idx[i] = i;

        // sort items by value/weight ratio, descending
        sort(idx.begin(), idx.end(), [&](int a, int b) {
            return (double)val[a] / wt[a] > (double)val[b] / wt[b];
        });

        double totalValue = 0.0;
        int capacity = W;

        for(int i : idx) {
            if(wt[i] <= capacity) {
                capacity -= wt[i];
                totalValue += val[i];
            }
            else {
                totalValue += val[i] * ((double)capacity / wt[i]);
                break; // knapsack full
            }
        }

        return totalValue;
    }
};
```
