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
Now for the largest ordered statistic, $i=n$
$$
f_{Y_{max}}(y)=n[F_Y(y)]^{n-1}f_Y(y)
$$

#### Examples
Find the PDF for $Y_{max}$ when $Y \sim Exponential( \lambda = 1)$

This is as simple as a PDF gets
$$
f_Y(y)=e^{-y}
$$
And the CDF is easy too
$$
F_Y(y)=\int_0^y e^{-t} dt= -e^{-t} |_0^y=1-e^{-y}
$$
Now using our formula
$$
f_{Y_{max}}(y)=n[1-e^{-y}]^{n-1}e^{-y}
$$
Notice that the PDF for $Y_{max}$ only depends on the size of the sample, $n$

*Tip:* if you want to double check that everything is correct, you can always integrate the PDF you found for $Y_i'$ over the bounds of $Y$ to make sure you end up with 1, a valid PDF.

In our example
$$
\int_0^\infty n[1-e^{-y}]^{n-1}e^{-y} dy = 1
$$
for all $n$