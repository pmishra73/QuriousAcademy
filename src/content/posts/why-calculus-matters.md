---
title: "Why calculus matters more than ever (and how to learn it)"
date: "2025-05-20"
category: "Mathematics"
readTime: "8 min"
excerpt: "From ML gradients to physics simulations — calculus is everywhere. A guide to learning it the right way, without drowning in formulas."
author: "Prasant Mishra"
---

When students ask me why they should learn calculus, I usually answer with a question: do you want to understand how anything in the modern world actually works?

Every AI model you've ever interacted with was trained using calculus. Every physics simulation, every graphics engine, every financial model. Calculus is the language the universe runs on — and in 2025, it's also the language that the most interesting software runs on.

The tragedy is that most people learn it wrong and give up before they see why it matters.

## The two big ideas (that's really all there is)

Calculus has two core concepts. Everything else is a consequence of them.

**The derivative** asks: how fast is something changing right now? If you're driving and your position is changing over time, the derivative of your position is your speed. If your speed is changing, the derivative of your speed is your acceleration.

**The integral** asks: what's the total accumulation of something? If you know how fast water is flowing into a tank at every moment, the integral tells you how much water is in the tank.

These two ideas are inverses of each other — that's the Fundamental Theorem of Calculus, and it's one of the most beautiful results in mathematics.

## Why calculus is the engine of machine learning

When a neural network "learns," what's actually happening?

The network makes a prediction. It's wrong. We measure *how wrong* using a loss function. Then we ask: which direction should we adjust each parameter to make the prediction less wrong?

That question — which direction, by how much — is answered entirely by calculus. Specifically, by computing the **gradient**: a vector of partial derivatives that tells you how the loss changes with respect to each parameter.

The algorithm that follows the gradient downhill toward lower loss is called **gradient descent**. Every ML model you've used — GPT, Stable Diffusion, AlphaFold — was trained with some variant of it.

If you want to understand AI beyond the surface level, calculus isn't optional.

## The problem with how it's usually taught

Standard calculus courses spend weeks on:

- Limits and the formal definition of a derivative
- Memorising differentiation rules
- Integration techniques
- Sequences and series

These are not useless. But they prioritise rigour over intuition. You end up able to differentiate `sin(x²)` but with no sense of *what a derivative means* geometrically.

Here's a better sequence for building real understanding:

### 1. Build the geometric intuition first

A derivative is a slope. Specifically, it's the slope of the tangent line to a curve at a point.

Draw a curve. Pick a point. The derivative at that point is the slope of the straight line that just *touches* the curve at that point. That's it. Everything else — the limit definition, the rules — is making that idea precise.

An integral is area under a curve. The integral of a function from `a` to `b` is the area between the curve and the x-axis over that interval.

Start with pictures. Formulas come later.

### 2. Learn the chain rule deeply

If you had to pick one rule to understand thoroughly, it's the chain rule. It tells you how to differentiate composite functions — functions of functions.

It also underpins backpropagation in neural networks directly. The chain rule applied repeatedly through layers of a network is literally how gradients flow.

### 3. Get to partial derivatives and gradients

In machine learning, your functions take thousands or millions of inputs (parameters). You need derivatives with respect to each one simultaneously. That's what partial derivatives and gradients are for.

Once you can compute a gradient, you understand — at a deep level — what it means to train a model.

## A learning path that actually works

**Week 1:** Derivatives — geometric intuition, basic rules, chain rule  
**Week 2:** Applications — optimisation, finding maxima and minima  
**Week 3:** Integrals — area interpretation, antiderivatives, Fundamental Theorem  
**Week 4:** Multivariable — partial derivatives, gradients, gradient descent

This is the sequence we follow in our Calculus in 3 Hours masterclass and Maths for ML weekend cohort. Four weeks of focused work is enough to genuinely understand calculus — not just pass an exam, but use it.

## The shortcut that isn't

There's a temptation to skip the maths and just use libraries that do it for you. PyTorch will compute gradients automatically. NumPy handles matrix operations.

But if you don't understand what the library is doing, you can't debug it when it fails. You can't reason about why a model isn't converging. You can't read a research paper.

The maths isn't a barrier to entry. It's what separates people who use tools from people who build them.

Calculus takes a few weeks of real effort. It's worth every hour.
