# $\chi^2$ Distribution

## Origin of $\chi^2$


We start with 
$$
Z \sim N(0,1)
$$
Recall 
$$
f_Z(z)= \frac{1}{\sqrt{2 \pi}}e^{-z^2/2}, \ \ \ \ \ \ -\infty<z<\infty
$$

Then let $X=Z^2$

It follows that $z=\sqrt{x}$ and $z=-\sqrt{x}$

Then we use the change of variables formula which gives us

$$
f_X(x)=f_Z(\sqrt{x})\frac{1}{2\sqrt{x}} + f_Z(-\sqrt{x})\frac{1}{2\sqrt{x}}
$$
By the symmetrical nature of the normal distribution, $f_Z(\sqrt{x})=f_Z(-\sqrt{x})$

So
$$
f_X(x)=\frac{f_Z(\sqrt{x})}{\sqrt{x}}
$$
Substituting we get 
$$
f_X(x)=\frac{1}{\sqrt{2 \pi}} \frac{e^{-x/2}}{\sqrt{x}}, \ \ \ x>0
$$

## $\chi^2$ is a special case of gamma

Recall the PDF of the Gamma Distribution
$$
f(x)=\frac{1}{\theta^\alpha\Gamma(\alpha)}x^{\alpha -1}e^{-x/\theta}
$$
where
- $\alpha$ = shape
- $\theta$ = scale

Now look at the PDF of a $\chi^2$ random variable
$$
f(x) = \frac{1}{2^{k/2}\Gamma(k/2)}x^{\frac{k}{2}-1}e^{-x/2}, \ \ \ x>0
$$
Where k is the degrees of freedom.

Take $k=1$
Note: $\Gamma(1/2)=\sqrt{\pi}$

So if random variable $X \sim \chi^2_1$
$$
f_X(x)=\frac{1}{\sqrt{2 \pi}} \frac{e^{-x/2}}{\sqrt{x}} \qquad \square
$$

