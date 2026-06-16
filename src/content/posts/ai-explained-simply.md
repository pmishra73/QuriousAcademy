---
title: "What is machine learning, really? A plain-English explanation"
date: "2025-05-14"
category: "AI & ML"
readTime: "5 min"
excerpt: "No jargon, no hype. Just a clear explanation of what ML models actually do — and why they're so powerful right now."
author: "Prasant Mishra"
---

Every week someone asks me to explain machine learning simply. Most explanations I've seen either over-simplify to the point of being wrong, or drown the reader in jargon before they've built any intuition.

Here's my attempt at a clean, honest explanation.

## Traditional programming vs. machine learning

In traditional programming, you write rules. You think carefully about all the cases, encode them as `if` statements, and the computer follows your instructions precisely.

```
if email contains "you've won" → mark as spam
if sender is in contacts → mark as not spam
```

This works well when you can enumerate the rules. It breaks down when you can't. How do you write rules for "does this photo contain a dog"? The rules are too complex, too numerous, and too dependent on context.

Machine learning flips the model. Instead of writing rules, you show the computer thousands of examples — photos labelled "dog" and "not dog" — and let it figure out the rules itself.

You provide: **data + labels**  
The algorithm produces: **rules (called a model)**

## What "learning" actually means

When we say a model "learns," we mean something precise: it adjusts numbers.

Every ML model is, at its core, a mathematical function with a large number of tuneable parameters — numbers that get adjusted during training. A large neural network might have billions of these parameters.

Training works like this:

1. The model makes a prediction ("this is a dog")
2. We compare the prediction to the correct answer ("it's actually a cat")
3. We measure the error (called the **loss**)
4. We adjust the parameters slightly to reduce that error
5. Repeat millions of times

Each iteration nudges the parameters in the direction that makes predictions slightly more accurate. Over millions of examples, the model gets very good at the task.

That's it. That's machine learning.

## Why it works now but didn't 20 years ago

The underlying ideas in ML are decades old. Backpropagation — the key algorithm for training neural networks — was popularised in the 1980s. So why is AI suddenly everywhere?

Three things changed simultaneously:

**Data.** The internet created datasets of a scale never seen before. ImageNet has 14 million labelled images. GPT-4 was trained on a significant fraction of the public internet. You need enormous data to train large models.

**Compute.** GPUs — originally designed for rendering video games — turned out to be perfect for the matrix operations that neural networks rely on. Training that would have taken years in 2005 takes days now.

**Architecture.** In 2017, Google published a paper called "Attention Is All You Need" introducing the **transformer** architecture. Transformers can process long sequences much more effectively than previous models and scale dramatically with more compute and data.

The combination of these three — data, compute, transformers — is what caused the AI explosion we're living through.

## What a large language model actually does

ChatGPT, Claude, Gemini — these are all large language models (LLMs). Here's what they're actually doing:

They were trained to predict the next word in a sequence. Given the text "The capital of France is", the model predicts "Paris." Given "To be or not to", it predicts "be."

That's the task. Next-word prediction. Billions of times. On most of the internet.

What emerged from training on this task at scale — surprisingly, and to the genuine confusion of researchers — was a model that can write code, explain concepts, translate languages, reason through problems, and much more.

The capability wasn't explicitly programmed. It emerged from the training process.

## What ML can't do

Understanding limits matters as much as understanding capabilities.

**ML models don't understand.** They've learned statistical patterns in their training data. When a model gives a confident wrong answer (a "hallucination"), it's because it's pattern-matching to something plausible rather than reasoning from facts.

**ML models don't generalise perfectly.** A model trained to identify dogs in photographs might fail badly on cartoon dogs, or on photographs taken at unusual angles. Distribution shift — when the real world looks different from training data — is a major source of failures.

**ML models encode their training data's biases.** If the training data reflects historical biases, the model will too.

These aren't bugs to be fixed in the next version. They're fundamental properties of current ML approaches.

## Where to go from here

If this sparked genuine curiosity, the natural next step is to train a simple model yourself. You don't need a PhD or a GPU. A logistic regression classifier on a simple dataset — something like predicting house prices or classifying emails — will teach you more in an afternoon than ten more articles.

Python, scikit-learn, and a Jupyter notebook are all you need. Start there.

If you want to go deeper — into neural networks, backpropagation, and how LLMs really work — our AI Demystified masterclass covers all of it live, with interactive demos, in three hours.
