---
title: "Data structures for absolute beginners — where to start"
date: "2025-04-28"
category: "Programming"
readTime: "9 min"
excerpt: "Arrays, linked lists, trees, graphs — it's overwhelming. This guide cuts through the noise and tells you exactly what to learn first."
author: "Prasant Mishra"
---

Data structures and algorithms is one of those topics that feels impossibly large when you're starting out. The number of things to learn seems endless: arrays, linked lists, stacks, queues, trees, heaps, graphs, hash maps, tries... and then sorting algorithms, searching algorithms, graph traversal, dynamic programming...

Stop. Breathe. You don't need to learn all of this at once, and you don't need to learn most of it before you start being productive.

Here's what you actually need, in what order.

## Why data structures matter

Before anything else, it's worth being clear on *why* data structures matter — because "it's needed for interviews" is a terrible reason to learn anything.

Data structures are about **organising data so that operations on it are efficient**. The choice of data structure directly determines how fast your program runs and how much memory it uses.

- Need to look up a value by key instantly? Use a hash map.
- Need to process items in the order they arrived? Use a queue.
- Need to always retrieve the smallest item? Use a heap.

Every program you'll ever write involves choosing data structures. Learning them well means writing programs that scale — that still work when your user base grows from 100 to 1,000,000.

## The 20% that does 80% of the work

### 1. Arrays (and dynamic arrays / lists)

Start here. An array is an ordered collection of elements stored in contiguous memory. In Python, the built-in `list` is a dynamic array — it resizes itself automatically.

What you need to know:
- Accessing element by index: O(1) — instant
- Inserting or deleting in the middle: O(n) — slow for large arrays
- Appending to the end (amortised): O(1)

Arrays are the default. When you're not sure what to use, start with an array. Most real programs are dominated by array operations.

### 2. Hash maps (dictionaries)

This is probably the most powerful data structure you'll use day-to-day. A hash map stores key-value pairs and lets you look up, insert, and delete by key in O(1) time on average.

In Python, it's `dict`. In JavaScript, it's `Object` or `Map`.

```python
phone_book = {}
phone_book["Alice"] = "9876543210"
phone_book["Bob"] = "9123456789"

# Look up instantly, regardless of size
print(phone_book["Alice"])  # 9876543210
```

When you see yourself writing loops to search for something, ask whether a hash map would let you look it up directly instead. Usually the answer is yes.

### 3. Sets

A set is like a hash map with only keys — no values. It's used when you need to know whether something is in a collection, and you need that check to be fast.

```python
seen = set()
for item in my_list:
    if item in seen:
        print(f"Duplicate: {item}")
    seen.add(item)
```

Without a set, checking "have I seen this before?" requires searching the whole list: O(n). With a set, it's O(1).

### 4. Stacks and queues

These are abstract data types — they define a *behaviour*, not a specific implementation.

**Stack (LIFO — Last In, First Out):** Think of a stack of plates. You can only add or remove from the top.  
Use cases: undo operations, function call tracking, parsing expressions.  
In Python: just use a `list` with `.append()` and `.pop()`.

**Queue (FIFO — First In, First Out):** Think of a line at a ticket counter. First person in is first person served.  
Use cases: BFS (breadth-first search), task scheduling, message queues.  
In Python: use `collections.deque` for efficient queue operations.

## What to learn second

Once you're comfortable with the above, add these:

### 5. Trees (specifically binary trees)

A tree is a hierarchical data structure: a root node, with child nodes, each of which can have their own children.

Binary trees — where each node has at most two children — appear everywhere: filesystems, HTML DOM, expression parsing, binary search trees.

The key operations to understand:
- Tree traversal: in-order, pre-order, post-order, BFS
- Binary search tree (BST): left child is smaller, right child is larger. Lookup, insert, delete in O(log n)

### 6. Graphs

Everything is a graph. Social networks, maps, dependency trees, state machines — all graphs.

A graph is a collection of nodes (vertices) and connections between them (edges). Trees are a special case of graphs.

Key algorithms:
- **DFS (Depth-First Search):** Explore as far as possible down one path before backtracking
- **BFS (Breadth-First Search):** Explore all neighbours before going deeper

These two traversal strategies appear in an enormous number of problems. Get comfortable with both.

## What to leave for later

**Heaps** — important, but you can learn them once you need priority queues  
**Tries** — for string problems; specialised  
**Segment trees, Fenwick trees** — advanced; competitive programming territory  
**Dynamic programming** — this is an *algorithmic technique*, not a data structure. Learn it after you're solid on the above.

## The practice loop that actually works

Reading about data structures is not the same as knowing them. You need to write code.

1. **Implement the data structure from scratch.** Write a linked list. Write a binary search tree. Don't use built-in implementations. Getting your hands dirty with the underlying logic cements understanding that reading never will.

2. **Then solve problems using the built-in.** Once you understand how it works, use Python's `dict` or `deque` — reinventing wheels in production code is silly.

3. **Recognise patterns.** Most algorithm problems map to a small set of patterns: sliding window, two pointers, BFS/DFS, dynamic programming. Learn to spot the pattern before you code.

**The best practice resource right now is LeetCode.** Start with Easy problems. Filter by topic — start with Arrays and Hash Maps. Aim to solve one problem per day consistently rather than grinding for eight hours on a weekend.

## The mindset shift that makes everything easier

When you see a new problem, don't ask "which algorithm should I use?" Ask:

**"What data structure would make this easy?"**

Often, if you pick the right data structure, the algorithm writes itself. The hard part isn't the code — it's recognising that you need a hash map, or a stack, or a BFS.

That recognition comes from practice. There's no shortcut, but there's a much shorter path than most people take: learn the fundamentals well, practice consistently, and build the pattern recognition over weeks not months.

You've got this.
