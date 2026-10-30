# Probability Inequalities


These inequalities bound tail probabilities like $P(X \ge a)$ using only partial information about $X$ (its mean, its variance, or its MGF). The more information we use, the tighter the bound.

## 1. Markov's Inequality

**Statement:** If $X \ge 0$ and $a > 0$, then

$$
P(X \ge a) \le \frac{E[X]}{a}.
$$

**Ex.** $E(x)=10$, $P(X\geq 20)\leq \frac12$. "If my average is 10, I can't have too much of my distribution to the right of 20."
If the average is 20 and $X$ is nonnegative then Markov's inequality says the only way for $P(X\geq 20) \geq \frac12$ is for
$P(X=20)=\frac12$ and $P(X=0)=\frac12$, this give $E(X)=10$ as the limiting case.

**What it needs:** only the mean, and $X$ must be *nonnegative*.

**Proof:** If $X\geq 0$ then $P(X\geq a) \leq \frac{E(X)}{a}$

$$
E(X)=\sum_x xP(X=x) \geq \sum_{x\geq a}xP(X=x) \geq \sum_{x\geq a}aP(X=x)=aP(X\geq a)
$$

## 2. Chebyshev's Inequality

**Statement:** If $X$ has mean $\mu$ and finite variance $\sigma^2$, then
for any $k > 0$,

$$
P(|X - \mu| \ge a) \le \frac{\sigma^2}{a^2}.
$$

**What it needs:** the mean and variance. $X$ can be negative.

**Proof:** Apply Markov to the nonnegative random variable $Y=(X-\mu)^2$
with $b=a^2$:

$$
P(|X - \mu| \ge a) = P\big((X - \mu)^2 \ge a^2\big)=\underbrace{P(Y\geq b)\leq \frac{E(Y)}{b}}_{\text{Markov's Inequality}}=\frac{\sigma^2}{a^2}
$$

**Note:** $E(Y)=E[(X-\mu)^2]=Var(X)=\sigma^2$

**Application (Weak Law of Large Numbers):** Let $X_1, \dots, X_n$ be iid
with mean $\mu$ and variance $\sigma^2$, and let $\bar{X}_n$ be the sample
mean. Then $E[\bar{X}_n] = \mu$ and $\text{Var}(\bar{X}_n) = \sigma^2/n$, so

$$
P(|\bar{X}_n - \mu| \ge \varepsilon) \le \frac{\sigma^2}{n\varepsilon^2}
\xrightarrow{n \to \infty} 0.
$$

## 3. Chernoff Bound

**Statement:** For any random variable $X$ with MGF
$M_X(t) = E[e^{tX}]$, and any $a$,

$$
P(X \ge a) \le \frac{M_X(t)}{e^{ta}} = e^{-ta} M_X(t)
\qquad \text{for every } t > 0,
$$

so the best bound comes from minimizing over $t$:

$$
P(X \ge a) \le \min_{t > 0} \, e^{-ta} M_X(t).
$$

For the lower tail, use $t < 0$: $P(X \le a) \le \min_{t < 0} \, e^{-ta} M_X(t)$.

**What it needs:** the whole MGF, which must exist near $0$.

**Proof:** For $t > 0$, the function $x \mapsto e^{tx}$ is positive and
increasing, so by Markov

$$
P(X \ge a) = P(e^{tX} \ge e^{ta}) \le \frac{E[e^{tX}]}{e^{ta}}.
$$

**Why it is useful for sums:** If $S_n = X_1 + \dots + X_n$ with the
$X_i$ independent, then $M_{S_n}(t) = \prod_i M_{X_i}(t)$, so

$$
P(S_n \ge a) \le \min_{t > 0} \, e^{-ta} \prod_{i=1}^n M_{X_i}(t).
$$

This gives tail bounds that decay *exponentially* in $n$, where
Chebyshev only gives $1/n$.

**Recipe:**

1. Write down $M_X(t)$.
2. Form $h(t) = e^{-ta} M_X(t)$, or $\log h(t) = -ta + \log M_X(t)$,
   which is easier to differentiate.
3. Set $\frac{d}{dt} \log h(t) = 0$, solve for $t^*$, and check that
   $t^* > 0$.
4. Plug $t^*$ back in to get the bound.

**Example (Normal):** $X \sim N(0, 1)$, so $M_X(t) = e^{t^2/2}$. For
$a > 0$,

$$
\log h(t) = -ta + \frac{t^2}{2}, \qquad
\frac{d}{dt}\log h(t) = -a + t = 0 \implies t^* = a,
$$

$$
P(X \ge a) \le e^{-a^2/2}.
$$

For $a = 3$: Chernoff gives $e^{-4.5} \approx 0.011$, while Chebyshev
(one-sided, using $P(X \ge 3) \le P(|X| \ge 3)$) only gives $1/9 \approx 0.111$.
The true value is about $0.0013$.

**Example (Binomial):** $X \sim \text{Bin}(n, p)$ with
$M_X(t) = (pe^t + q)^n$. Then for $a > np$,

$$
P(X \ge a) \le \min_{t>0} \, e^{-ta}(pe^t + q)^n.
$$

Setting the derivative to zero gives $e^{t^*} = \frac{aq}{(n-a)p}$.

## Comparison

| Inequality | Uses | Assumption | Tail decay in $a$ |
|---|---|---|---|
| Markov | $E[X]$ | $X \ge 0$ | $1/a$ |
| Chebyshev | $\mu, \sigma^2$ | finite variance | $1/a^2$ |
| Chernoff | $M_X(t)$ | MGF exists | exponential, e.g. $e^{-a^2/2}$ |
