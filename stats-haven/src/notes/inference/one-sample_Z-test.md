# The One-Sample Z-Test
This test is used to make an inference on the population mean parameter $\mu$

This test requires some assumptions to be true about our sample 
- The population standard deviation $\sigma$ needs to be known
- Each sample is $iid$, independent indentically distributed
- The population needs to be normal or your sample size $n \geq 30$

Recall the estimator for the population parameter $\mu$
$$
\bar{X}=\frac{\sum_{i=1}^n x_i}{n}
$$
The sample average.

This estimator is unbiased, meaning $E[\bar{X}]=\mu$
It is a minimum variance estimator it achieves the Cramér–Rao lower bound
$$
Var(\bar{X})=\frac{\sigma^2}{n}
$$
It is a sufficient estimator because $\bar{X}$ contains all the information from our sample
It is also a consistent estimator meaning the variance goes to 0 as the sample size goes to $\infty$
$$
\bar{X} \xrightarrow{P} \mu
$$
In other words, $\bar{X}$ is the goat at estimating $\mu$.

### Getting the Z-Statistic
First we calculate our sample statistic, $\bar{X}$.
Then by our assumption of normality of the sampling distribution or if the sample size is large and the central limit theorem kicks in then $\bar{X}$ is a normal random variable.

The way we standardize a normal random variable is subtract by the mean and divide by the standard deviation.
$$
Z=\frac{\bar{X}-\mu}{\sigma/\sqrt{n}}
$$

It can be shown that standard deviation of $\bar{X}=\sigma/\sqrt{n}$

This is our Z-statistic