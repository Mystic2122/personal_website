# The Gamma Distribution
Suppose Poisson events are occuring at an average rate $\lambda$ per unit time. Let the random variable $Y$ represent the waiting time until the $r^{th}$ event. $Y$ is said to follow a Gamma distribution.

$$
f_Y(y)=\frac{\lambda^r}{(r-1)!}y^{r-1}e^{-\lambda y}, \ \ \ y>0
$$

### Generalizing to all real numbers
We can't measure the time until the $6.7^{th}$ event, but a Gamma distribution does represent the time until the $k^{th}$ event. This can also be thought of as a sum of exponential random variables.

**The Gamma Function**
$$
\Gamma(r)=\int_0^\infty y^{r-1}e^{-y}dy
$$

For any real number $r>0$ then:
- $\Gamma(1)=1$
- $\Gamma(r) = (r-1) \Gamma (r-1)$
- If r is an integer then $\Gamma (r) = (r-1)!$
- $\Gamma (1/2) = \sqrt{\pi}$

**The Gamma Distribution**
$$
f_Y(y;\alpha, \lambda)=\frac{\lambda^\alpha}{\Gamma (\alpha)}x^{\alpha -1}e^{-\lambda x}, \ \ \ x \geq 0
$$

$\alpha$ is the shape parameter. It can be thought of as the number of exponentially distributed events are being added together. When $\alpha = 1$ the Gamma distribution shrinks down to an exponetial, $\lambda e^{-\lambda x}$.
<br>
Remember how we rewrote an exponential distribution to get a better interpretation of $\lambda$?

If the Gamma distribution is instead written as
$$
f_Y(y)=\frac{1}{\Gamma (\alpha)\lambda^\alpha}y^{\alpha -1}e^{-y/\lambda}
$$
Now $\lambda$ is now the average time between events.

- $E[Y] = \alpha \lambda$
- $Var(Y) = \alpha \lambda^2$