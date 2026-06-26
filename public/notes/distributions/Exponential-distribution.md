## The Exponential Distribution

#### Why is it Useful?

The exponential distribution is used to model time between random, independent events.

Examples
- Time until recieving scam phone calls
- Time until the next customer enters the checkout line
- Time until the next blue car drives by

### To be Memoryless

> Knowing that you've already waited for some amount of time tells you nothing about how much longer you'll have to wait.
>> ChatGPT

A probability example would be, supposes you've already been waiting at a bus stop for 5 minutes, what is the probability that you will have to wait at least 10 more minutes for the but to arrive?

The memoryless property says
$$
P(X>15|X>5)=P(X>10)
$$

More generally
$$
P(X>s+t|X>s)=P(X>t)
$$

## The Distribution

There are 2 common forms for the exponential distribution.
From my experience the more common one to see is 
$$
f_X(x)=\lambda e^{-\lambda x}, \ \ \ x\geq 0
$$
In this version, $\lambda$ represents the average number of events per unit time. While $1/\lambda$ is the average waiting time. 
For this version:
- $E[X] = 1/\lambda$
- $Var(X) = 1/\lambda^2$

The exponential distribution can also be writen as
$$
f_X(x)=\frac{1}{\lambda}e^{-x/\lambda}, \ \ \ x \geq 0
$$

This form just swaps the meanings of $\lambda$ from above. Now $\lambda$ is the average waiting time and $1/\lambda$ represents the expected number of events per unit time. 

This also makes 
- $E[X] = \lambda$
- $Var(X) = \lambda^2$

### Moment Generating Function
To find the moment generating function we need to calculate
$$
M_X(t)=E[e^{tX}]
$$

Gotta do some math
$$
M_X(t)=\int_0^\infty e^{tx}\frac{1}{\lambda}e^{-x/\lambda} dx \newline =\frac{1}{\lambda}\int_0^\infty e^{(t-\frac{1}{\lambda})x}dx \newline M_X(t)=\frac{1}{1-\lambda t}
$$
This converges when $t<\frac{1}{\lambda}$

For the exponential with the form $f(x)=\lambda e^{-\lambda x}$
The moment generating function is
$$
M_X(t)=\frac{\lambda}{\lambda - t}
$$
This converges when $t<\lambda$

### The CDF
The cummulative distribution function for an exponetial random variable is
$$
F(x)=\int_0^x\frac{1}{\lambda}e^{-t/\lambda}dt \newline =  -e^{-t/\lambda}|_0^x \newline =1-e^{-x/\lambda}, \ \ \ \ x \geq 0
$$

Note the survival function $P(X>x)\newline =1-F(x)=e^{-x/\lambda}$

This is the probability that an event has not occured by time x.

For the form
$$
f_X(x)=\lambda e^{-\lambda x}, \ \ \ x\geq 0
$$
The CDF is 
$$
1-e^{-\lambda x}
$$
The corresponding survival function is $e^{-\lambda x}$

### Connection to Poisson Random Variables

Recall a Poisson random variable gives the probability of seeing k events in t time intervals. With the average number of events for any giving time interval $\lambda$.
$$
P(X=k)=\frac{e^{-\lambda t}(\lambda t)^k}{k!}
$$

Now observe when we estimate the probability of seeing no arrivals during the first t time interval.
$$
P(X=0)=\frac{e^{-\lambda t}(\lambda t)^0}{0!} \newline =e^{-\lambda t}
$$
The survival function for an exponential!