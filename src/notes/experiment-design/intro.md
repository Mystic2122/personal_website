# Introduction to Design of Experiments

When designing an experiment, our goal is to measure how a group of factors (also called effects) influence a response variable. Some factors may be highly correletated with the response variable while others explain nothing of interest. 

Experiments are used to design models that can predict response variables using one or more factors (explanitory variables).

We feed in our data, do a bunch of math to calculate coefficients for our effects, then evaluate the model.

Experiments can require a lot of data especially as we increase the number of factors. One common design for an experiment is called a factorial design. You test each factor at two levels, a high level and a low level. To conduct what is known as a full factorial experiment, with $k$ factors, will require $2^k$ data points in order to see every factor combination. 
For 2 factors you only require $2^2=4$ experiments with the factor levels being $(low, low),(low,high),(high,low),(high,high)$.
A full factorial design with 8 factors will require $2^8=256$ experimental runs. We will look at ways to lower this number such as considering blocking factors and using fractional factorial designs. 

