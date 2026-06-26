# Ordered Statistics
The idea of ordered statistics can be applied to a sample from any distribution. 

Let $Y$ be a continuous random varable where obersvations $y_1,y_2,...,y_n$ are taken. We reorder our sample from smallest to largest
$$
y_1'<y_2'<...<y_n'
$$

The 2 ordered statistics we often care about the most are
- *smallest ordered statistic*, $y_1'$ also called $y_{min}$
- *largest ordered statistic*, $y_n'$ also called $y_{max}$

#### This is confusing
$Y_{min}$ and $Y_{max}$  are **random variables** with their own distributions $f_{Y_{min}}(y)$ and $f_{Y_{max}}(y)$. We will look at these distributions soon, along with the distribution for any ordered statistic.

## The Formula
Don't be scared but this is the formula for the $i^{th}$ ordered statistic
$$
f_{Y_i'(y)}=\frac{n!}{(i-1)!(n-i)!}[F_Y(y)]^{i-1}[1-F_Y(y)]^{n-i}f_Y(y)
$$

Let's unpack this

- $f_Y(y)$ is the original PDF of the random variable $Y$. Remember, this can be any distribution.
- $F_Y(y)$ is then the CDF of the random variable $Y$. 
- $n$ is the size of the sample

### Formulas for $f_{Y_{min}}(y)$ and $f_{Y_{max}}(y)$

Let's start with the smallest ordered statistic

In this case $i=1$ so we see a few terms disappear
$$
f_{Y_{min}}(y)=n[1-F_Y(y)]^{n-1}f_Y(y)
$$
<br>
Now for the largest ordered statistic, $i=n$
$$
f_{Y_{max}}(y)=n[F_Y(y)]^{n-1}f_Y(y)
$$
