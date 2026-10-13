# Moment Generating Functions

## Definition

For a random variable $X$, the **moment-generating function (mgf)** is

$$
M_X(t) = E\left(e^{tX}\right) = \begin{cases} \displaystyle\sum_{\text{all } k} e^{tk}\, p_X(k) & X \text{ discrete} \\[2ex] \displaystyle\int_{-\infty}^{\infty} e^{tx} f_X(x)\, dx & X \text{ continuous} \end{cases}
$$





## Why it "generates moments"

Expand $e^{tX}$ as a Taylor series:

$$
e^{tX} = 1 + tX + \frac{t^2X^2}{2!} + \frac{t^3X^3}{3!} + \cdots
$$

Take expectations term by term:

$$
M_X(t) = 1 + E(X)\,t + E(X^2)\frac{t^2}{2!} + E(X^3)\frac{t^3}{3!} + \cdots
$$

So $M_X(t)$ is a power series whose coefficients are the moments. Differentiating $r$ times and setting $t = 0$ removes every term except the $r^{th}$.

**Theorem:** Let $X$ be a random variable with the PDF $f_X(x)$. Let $M_X(t)$ be the moment-generating function for $X$. Then assuming the $r^{th}$ moment exists,

$$
M_X^{(r)}(0) = E(X^r)
$$

### Using MGFs

#### Raw moments vs. central moments

**Raw moments** (moments about $0$): $E(X^r)$. These come straight from the mgf: $E(X^r) = M_X^{(r)}(0)$.

**Central moments** (moments about the mean): $E\left[(X - \mu)^r\right]$, where $\mu = E(X)$. These measure spread and shape, and they don't change if you shift $X$ by a constant.

Get raw moments first by differentiating $M_X(t)$, then convert them to central moments by expanding $(X - \mu)^r$ with the binomial theorem.

#### 1st moment: the mean (location)

$$
\mu = E(X) = M_X'(0)
$$

The first central moment is always $E(X - \mu) = 0$

#### 2nd moment: variance (spread)

The raw second moment is $E(X^2) = M_X''(0)$. The second central moment is the **variance**:

$$
\sigma^2 = \text{Var}(X) = E\left[(X - \mu)^2\right]
$$

Expanding $(X - \mu)^2 = X^2 - 2\mu X + \mu^2$ and taking expectations:

$$
E\left[(X-\mu)^2\right] = E(X^2) - 2\mu E(X) + \mu^2 = E(X^2) - \mu^2
$$

so

$$
\text{Var}(X) = E(X^2) - [E(X)]^2 = M_X''(0) - \left[M_X'(0)\right]^2
$$

#### 3rd moment: skewness (asymmetry)

$$
\gamma_1 = \frac{E\left[(X - \mu)^3\right]}{\sigma^3}
$$

**Idea:** cubing a deviation **keeps its sign** and **exaggerates large deviations**.

- Points above the mean give positive values, points below give negative values.
- If the distribution is symmetric, the two sides cancel: $\gamma_1 = 0$.
- If one side has a long tail, its big deviations win after cubing, so $\gamma_1$ takes that side's sign.

| $\gamma_1$ | Shape |
|---|---|
| $= 0$ | symmetric (e.g., normal) |
| $> 0$ | long **right** tail (e.g., exponential) |
| $< 0$ | long **left** tail |

#### 4th moment: kurtosis (tail weight)

$$
\text{Kurtosis } = \frac{E\left[(X - \mu)^4\right]}{\sigma^4}
$$

**Idea:** raising a deviation to the 4th power makes it always positive (like variance) and increases the weight of extreme values. This measures how much of the spread comes from outliers.

$$
\text{Excess kurtosis } (\gamma_2) = \frac{E\left[(X - \mu)^4\right]}{\sigma^4}-3
$$
The $-3$ makes the normal distribution the baseline ($\gamma_2 = 0$).

| $\gamma_2$ | Tails |
|---|---|
| $= 0$ | like the normal |
| $> 0$ | **heavier** tails, more outliers |
| $< 0$ | **lighter** tails, fewer outliers |


### Uniqueness of MGFs

**Theorem:** If $M_{X_1}(t) = M_{X_2}(t)$ on an interval containing $0$, then $X_1$ and $X_2$ have the same distribution. 


**Proof:** Don't worry about it $\blacksquare$


#### Linear transformations of the r.v.'s MGF

$$
M_{aX+b}(t) = e^{bt}M_X(at)
$$

**Proof:**

$$
M_{aX+b}(t) = E\left(e^{t(aX+b)}\right) = e^{bt}\,E\left(e^{(at)X}\right) = e^{bt}M_X(at)
$$

#### Sums of independent random variables
If $X_1, \dots, X_n$ are independent and $S = X_1 + \cdots + X_n$, then

$$
M_S(t) = \prod_{i=1}^{n} M_{X_i}(t)
$$

**Proof:**

$$
M_S(t) = E\left(e^{tX_1}\cdots e^{tX_n}\right) \underset{\text{by independence}}{=} E\left(e^{tX_1}\right)\cdots E\left(e^{tX_n}\right)
$$


## MGFs of Common Distributions

### Exponential

$f_X(x) = \lambda e^{-\lambda x}$, $x > 0$, with $\lambda > 0$.

$$
M_X(t) = \int_0^\infty e^{tx}\,\lambda e^{-\lambda x}\,dx = \lambda \int_0^\infty e^{-(\lambda - t)x}\,dx
$$

For $t < \lambda$ the exponent is negative and the integral converges:

$$
M_X(t) = \lambda \left[\frac{-e^{-(\lambda - t)x}}{\lambda - t}\right]_0^\infty = \lambda\left(0 + \frac{1}{\lambda - t}\right)
$$

$$
\boxed{M_X(t) = \frac{\lambda}{\lambda - t}, \qquad t < \lambda}
$$

**Mean and variance:** 
Write $M_X(t) = \lambda(\lambda - t)^{-1}$ and differentiate with the chain rule:

$$
M_X'(t) = \lambda(-1)(\lambda - t)^{-2}(-1) = \frac{\lambda}{(\lambda - t)^2}
$$

$$
M_X''(t) = \lambda(-2)(\lambda - t)^{-3}(-1) = \frac{2\lambda}{(\lambda - t)^3}
$$

Set $t = 0$:

$$
E(X) = M_X'(0) = \frac{\lambda}{\lambda^2} = \frac{1}{\lambda}
$$

$$
E(X^2) = M_X''(0) = \frac{2\lambda}{\lambda^3} = \frac{2}{\lambda^2}
$$

Then

$$
\text{Var}(X) = E(X^2) - [E(X)]^2 = \frac{2}{\lambda^2} - \frac{1}{\lambda^2} = \frac{1}{\lambda^2}
$$
### Normal

**Step 1: standard normal.** $f_Z(z) = \dfrac{1}{\sqrt{2\pi}}e^{-z^2/2}$, $-\infty < z < \infty$.

$$
M_Z(t) = \int_{-\infty}^{\infty} e^{tz}\,\frac{1}{\sqrt{2\pi}}e^{-z^2/2}\,dz = \int_{-\infty}^{\infty} \frac{1}{\sqrt{2\pi}}\,e^{tz - z^2/2}\,dz
$$

Complete the square in the exponent:

$$
tz - \frac{z^2}{2} = -\frac{1}{2}\left(z^2 - 2tz\right) = -\frac{1}{2}\left[(z - t)^2 - t^2\right] = -\frac{(z-t)^2}{2} + \frac{t^2}{2}
$$

The $t^2/2$ term doesn't involve $z$, so it factors out:

$$
M_Z(t) = e^{t^2/2}\underbrace{\int_{-\infty}^{\infty} \frac{1}{\sqrt{2\pi}}\,e^{-(z-t)^2/2}\,dz}_{=\,1 \text{ (the } N(t,\,1) \text{ pdf)}} = e^{t^2/2}
$$

**Step 2: general normal.** If $X \sim N(\mu, \sigma^2)$, then $X = \mu + \sigma Z$. With a linear transformation of the r.v. with $a = \sigma$, $b = \mu$:

$$
M_X(t) = e^{\mu t}M_Z(\sigma t) = e^{\mu t}e^{\sigma^2 t^2/2}
$$

$$
\boxed{M_X(t) = e^{\mu t + \sigma^2 t^2/2}, \qquad \text{all } t}
$$


**Mean and variance:** 
Let $M_X(t) = e^{\mu t + \sigma^2 t^2/2}$. \
Differentiate using the chain rule
The derivative of the exponent $\mu t + \frac{\sigma^2 t^2}{2}$ is $\mu + \sigma^2 t$:

$$
M_X'(t) = (\mu + \sigma^2 t)\, e^{\mu t + \sigma^2 t^2/2} = (\mu + \sigma^2 t)\, M_X(t)
$$

Differentiate again with the product rule:

$$
M_X''(t) = \sigma^2\, M_X(t) + (\mu + \sigma^2 t)\, M_X'(t) = \sigma^2\, M_X(t) + (\mu + \sigma^2 t)^2\, M_X(t)
$$

Set $t = 0$, using $M_X(0) = e^0 = 1$:

$$
E(X) = M_X'(0) = (\mu + 0)(1) = \mu
$$

$$
E(X^2) = M_X''(0) = \sigma^2(1) + (\mu + 0)^2(1) = \sigma^2 + \mu^2
$$

Then

$$
\text{Var}(X) = E(X^2) - [E(X)]^2 = \sigma^2 + \mu^2 - \mu^2 = \sigma^2
$$


### Poisson

$p_X(k) = \dfrac{e^{-\lambda}\lambda^k}{k!}$, $k = 0, 1, 2, \dots$, with $\lambda > 0$.

$$
M_X(t) = \sum_{k=0}^{\infty} e^{tk}\,\frac{e^{-\lambda}\lambda^k}{k!} = e^{-\lambda}\sum_{k=0}^{\infty} \frac{\left(\lambda e^t\right)^k}{k!}
$$

Use the exponential series $\displaystyle\sum_{k=0}^{\infty} \frac{r^k}{k!} = e^r$ with $r = \lambda e^t$:

$$
M_X(t) = e^{-\lambda}e^{\lambda e^t}
$$

$$
\boxed{M_X(t) = e^{\lambda\left(e^t - 1\right)}, \qquad \text{all } t}
$$

**Mean and variance:** 
Let $M_X(t) = e^{\lambda(e^t - 1)}$. 
Differentiate using the chain rule
The derivative of the exponent $\lambda(e^t - 1)$ is $\lambda e^t$:

$$
M_X'(t) = \lambda e^t\, e^{\lambda(e^t - 1)} = \lambda e^t\, M_X(t)
$$

Differentiate again with the product rule:

$$
M_X''(t) = \lambda e^t\, M_X(t) + \lambda e^t\, M_X'(t) = \lambda e^t\, M_X(t) + \left(\lambda e^t\right)^2 M_X(t)
$$

Set $t = 0$, using $e^0 = 1$ and $M_X(0) = e^{\lambda(1 - 1)} = 1$:

$$
E(X) = M_X'(0) = \lambda(1)(1) = \lambda
$$

$$
E(X^2) = M_X''(0) = \lambda(1)(1) + \lambda^2(1) = \lambda + \lambda^2
$$

Then

$$
\text{Var}(X) = E(X^2) - [E(X)]^2 = \lambda + \lambda^2 - \lambda^2 = \lambda
$$


### Binomial

$p_X(k) = \dbinom{n}{k}p^k(1-p)^{n-k}$, $k = 0, 1, \dots, n$.

**Route 1: direct.**

$$
M_X(t) = \sum_{k=0}^{n} e^{tk}\binom{n}{k}p^k(1-p)^{n-k} = \sum_{k=0}^{n} \binom{n}{k}\left(pe^t\right)^k(1-p)^{n-k}
$$

By the binomial theorem $\displaystyle\sum_{k=0}^{n}\binom{n}{k}a^k b^{n-k} = (a+b)^n$ with $a = pe^t$, $b = 1-p$:

$$
\boxed{M_X(t) = \left(1 - p + pe^t\right)^n, \qquad \text{all } t}
$$

**Mean and variance:** 
Let $M_X(t) = \left(1 - p + pe^t\right)^n$. Differentiate using the chain rule
The derivative of the base $1 - p + pe^t$ is $pe^t$:

$$
M_X'(t) = n\left(1 - p + pe^t\right)^{n-1} pe^t
$$

Differentiate again with the product rule, treating $n\left(1 - p + pe^t\right)^{n-1}$ and $pe^t$ as the two factors:

$$
M_X''(t) = n(n-1)\left(1 - p + pe^t\right)^{n-2}\left(pe^t\right)^2 + n\left(1 - p + pe^t\right)^{n-1} pe^t
$$

Set $t = 0$. The base becomes $1 - p + p = 1$, so every power of it equals $1$:

$$
E(X) = M_X'(0) = n(1)^{n-1}p = np
$$

$$
E(X^2) = M_X''(0) = n(n-1)(1)^{n-2}p^2 + n(1)^{n-1}p = n(n-1)p^2 + np
$$

Then

$$
\text{Var}(X) = E(X^2) - [E(X)]^2 = n(n-1)p^2 + np - n^2p^2
$$

Expanding $n(n-1)p^2 = n^2p^2 - np^2$
The $n^2p^2$ terms cancel:

$$
\text{Var}(X) = np - np^2 = np(1-p)
$$

### Gamma

$f_X(x) = \dfrac{\lambda^r}{\Gamma(r)}x^{r-1}e^{-\lambda x}$, $x \ge 0$, with shape $r > 0$ and rate $\lambda > 0$

**Useful integral:** for $\beta > 0$, substituting $u = \beta x$,

$$
\int_0^\infty x^{r-1}e^{-\beta x}\,dx = \frac{1}{\beta^r}\int_0^\infty u^{r-1}e^{-u}\,du = \frac{\Gamma(r)}{\beta^r}
$$

Now the mgf:

$$
M_X(t) = \int_0^\infty e^{tx}\,\frac{\lambda^r}{\Gamma(r)}x^{r-1}e^{-\lambda x}\,dx = \frac{\lambda^r}{\Gamma(r)}\int_0^\infty x^{r-1}e^{-(\lambda - t)x}\,dx
$$

For $t < \lambda$, apply the useful integral with $\beta = \lambda - t$:

$$
M_X(t) = \frac{\lambda^r}{\Gamma(r)}\cdot\frac{\Gamma(r)}{(\lambda - t)^r}
$$

$$
\boxed{M_X(t) = \left(\frac{\lambda}{\lambda - t}\right)^r = \left(1 - \frac{t}{\lambda}\right)^{-r}, \qquad t < \lambda}
$$

**Mean and variance:** 
Write $M_X(t) = \lambda^r(\lambda - t)^{-r}$ and differentiate with the chain rule
The derivative of $(\lambda - t)$ is $-1$:

$$
M_X'(t) = \lambda^r(-r)(\lambda - t)^{-r-1}(-1) = r\lambda^r(\lambda - t)^{-(r+1)}
$$

$$
M_X''(t) = r\lambda^r\big(-(r+1)\big)(\lambda - t)^{-(r+2)}(-1) = r(r+1)\lambda^r(\lambda - t)^{-(r+2)}
$$

Set $t = 0$:

$$
E(X) = M_X'(0) = r\lambda^r\lambda^{-(r+1)} = \frac{r}{\lambda}
$$

$$
E(X^2) = M_X''(0) = r(r+1)\lambda^r\lambda^{-(r+2)} = \frac{r(r+1)}{\lambda^2}
$$

Then

$$
\text{Var}(X) = E(X^2) - [E(X)]^2 = \frac{r(r+1)}{\lambda^2} - \frac{r^2}{\lambda^2} = \frac{r^2 + r - r^2}{\lambda^2} = \frac{r}{\lambda^2}
$$


### Examples 
#### Sum of Poissons
If $X_1 \sim \text{Poisson}(\lambda_1)$ and $X_2 \sim \text{Poisson}(\lambda_2)$ are independent,

$$
M_{X_1+X_2}(t) = e^{-\lambda_1 + \lambda_1 e^t}\cdot e^{-\lambda_2 + \lambda_2 e^t} = e^{-(\lambda_1+\lambda_2) + (\lambda_1+\lambda_2)e^t}
$$

which is the $\text{Poisson}(\lambda_1 + \lambda_2)$ mgf, so by uniqueness $X_1 + X_2 \sim \text{Poisson}(\lambda_1 + \lambda_2)$.

#### Standardizing a Normal
If $X \sim N(\mu, \sigma^2)$ with $M_X(t) = e^{\mu t + \sigma^2 t^2/2}$, then with a linear transformation with $a = 1/\sigma$, $b = -\mu/\sigma$:

$$
M_{(X-\mu)/\sigma}(t) = e^{-\mu t/\sigma}\, M_X\!\left(\frac{t}{\sigma}\right) = e^{-\mu t/\sigma}\, e^{\mu t/\sigma + \sigma^2 (t/\sigma)^2/2} = e^{t^2/2}
$$

which is the mgf of $Z \sim N(0,1)$, so $\dfrac{X - \mu}{\sigma} \sim N(0, 1)$.
