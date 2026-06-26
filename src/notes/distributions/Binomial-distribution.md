## The Binomial Distribution
The Binomial distribution can be thought of as a random varaible, $X$, denoting the number of successes, k, in n independent trials. It is the sum of n independent Bernoulli random variables. 

Remmeber a Bernoulli random variable is as simple as it gets. 
$$
P(X=x)=p^x(1-p)^{1-x}
$$
Where $x$ is either 0 (failure) or 1 (success).

When adding these 1's and 0's, the order in which the successes occur doesn't matter, as long as we end with exactly k.

**Binomial Distribution**
$$
P(X=k) = \binom{n}{k}p^k(1-p)^{n-k}
$$
Where $p$ is the probability of success.

### The Cumulative Distribution
To find the probability of observing more or less than some number of successes, all you need is a sum.

*Example*
Flip a fair coin 20 times. What are the chances you see 15 or more heads?

$$
P(X\geq 15)=\sum_{k=15}^{20}\binom{20}{k}0.5^k(1-0.5)^{20-k}\approx 0.0207
$$

You can expect to see 15 or more heads about 2% of the time.

**Expected Value**
The expected value for a Bernoulli is just $p$ or the probability of success. If we add up n independent trials we would expect the expected value to be $np$. 

If $X \sim Binomial(n,p)$ then $E[X] = np$

**Variance**
Same goes for the variance of a bernoulli random variable being $p(1-p)$.

If $X \sim Binomial(n,p)$ then $Var(X) = np(1-p)$

### Converging to Normal
For large $n$ the Binomial distribution can be approximated with a normal distribution
*Rule of Thumb:* $n$ is considered large when $np>10$ and $n(1-p)>10$

You can either standardize the binomial random variable $X$ like
$$
\frac{X-np}{\sqrt{np(1-p)}} \to N(0,1)
$$
or not 
$$
X \to N(\mu=np,\sigma^2=np(1-p))
$$

This happens because the binomial coefficient $\binom{n}{k}$ has more combinations the closer k is the middle of the sample size.

**Proof**
Start with the Binomial PMF
$$
P(X=k)=\frac{n!}{k!(n-k)!}p^k(1-p)^{n-k}
$$
Some dude figured out that for large $m$
$$
m! \approx \sqrt{2\pi m}\left(\frac{m}{e}\right)^m
$$
Plugging this in for the binomial coefficent we get
$$
\frac{\sqrt{2 \pi n} \frac{n^n}{e^n}}{\sqrt{2\pi k}\frac{k^k}{e^k} \cdot \sqrt{2\pi(n-k)}\frac{(n-k)^{n-k}}{e^{n-k}}}
$$
Notice the $e^n$ cancels completely
We are left with 
$$
P(X=k)\approx\frac{\sqrt{2\pi n}\cdot n^n}{2\pi\sqrt{k(n-k)}\cdot k^k\cdot(n-k)^{n-k}}\cdot p^k(1-p)^{n-k} 
$$
$$
=\frac{1}{\sqrt{2\pi}} \cdot\frac{\sqrt{n}}{\sqrt{k(n-k)}} \cdot \frac{n^n}{k^k(n-k)^{n-k}}\cdot p^k (1-p)^{n-k}
$$
Group everything raised to the $k$ and $n-k$ together
$$
P(X=k)\approx \frac{1}{\sqrt{2\pi}}\cdot \sqrt{\frac{n}{k(n-k)}}\cdot \left(\frac{np}{k} \right)^k\cdot \left(\frac{n(1-p)}{n-k} \right)^{n-k}
$$
Take $ln()$ to make the math easier
$$
ln(P(X=k))=-\frac{1}{2}ln(2\pi)+\frac{1}{2}ln(n)-\frac{1}{2}ln(k(n-k))+kln\left(\frac{np}{k}\right)+(n-k)ln\left(\frac{n(1-p)}{n-k} \right)
$$
Now we expand around $k=np$
Let $x=k-np$, the deviation from the mean
Then
- $k=np+x$
- $n-k=n(1-p)-x$

Now we do a Taylor Expansion around $ln(np)$
The taylor expansion for $ln(np+x)$ is 
$$
ln(np+x)=ln(np)+\frac{x}{np}-\frac{x^2}{2(np)^2}+...
$$
and
$$
ln(n(1-p)-x)=ln(n(1-p))-\frac{x}{n(1-p)}-\frac{x^2}{2(n(1-p))^2}-...
$$
We can do this because we are only focusing around the mean of the distribution, so the taylor approximation is a good one.
Also, we only care about the first 2 derivatives of the taylor expansion, everything after becomes negligible as $n \to \infty$

