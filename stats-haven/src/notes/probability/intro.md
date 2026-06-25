# An Introduction to Probability

## Samples and Sample Sapces

*Definition:* A **population** is the complete set of individuals or outcomes we are interested in studying.

Examples of populations include: 
- All voters in California
- Every lightbulb produced by a factory
- Every statistics student at a university

*Definition:* A **sample** is a subset of the population.

Since collecting data takes time and can be expensive, we make assumptions about a population based on the sample we collect. 

Note: A good sample is one that represents the population of interest well.

Examples of samples:
- 100 randomly selected Californian voters
- 50 lightbulbs tested from today's production
- 1 roll of a die

*Definition:* A **sample space** is the set of all possible outcomes of and experiment.

Examples of sample spaces:
Rolling 1 die
$$
S=\{1,2,3,4,5,6\}
$$

Flipping 1 coin
$$
S=\{Heads,Tails\}
$$

Flipping 2 coins
$$
S=\{HH,HT,TH,TT\}
$$

*Definition:* An **event** is a subset of the sample space.
Example, the event of rolling an even number on a die
$$
E=\{2,4,6\}
$$

## Going Further

The simplist way to define a sample space is by listing all possible outcomes as we did above. However, sometimes this is not possible.

Suppose a coin is tossed until the first tail appears. This gives us an infinite sample space
$$
S=\{T,HT,HHT,HHHT,...\}
$$
In this case we define the sample space by showing a pattern.

What about continuous sample spaces?
In this case we need to provide a structure of the sample space.

Let's define the sample space containing all quadratic functions
Let $ax^2+bx+c = 0$
Then 
$$
S=\{(a,b,c): -\infty<a< \infty,-\infty<b<\infty,-\infty<c<\infty, a \neq 0 \}
$$

Now let's define event A such that the quadratic function has real roots
$$
A=\{(a,b,c) \in S:b^2-4ac \geq 0\}
$$

Note: $\in$ means in and : means such that. The above line would read "Event A consists of all combinations of a,b, and c in the sample space S such that $b^2-4ac \geq 0$.

### Practice Problems

1. An urn contains six chips numbered 1 through 6. What outcomes are in the event "The second smallest chip is a 3"? Assume order doesn't matter and chips are drawn without raplacement.

<details>
<summary>Click to show answer</summary>
$$
A=\{(1,3,4),(2,3,4),(1,3,5),(2,3,5),(1,3,6),(2,3,6)\}
$$
</details>
<br>

2. What is the population being described by a sample of 100 randomly selected students from a university.

<details>
<summary>Click to show answer</summary>
The population is all students enrolled at the university.
</details>
<br>

3. A point is randomly selected in a unit square
$$
S=\{(x,y): 0\leq x \leq 1, 0\leq y \leq 1\}
$$
Define the event A such that the random point is above the line $y=x$

<details>
<summary>Click to show answer</summary>
$$
A = \{(x,y) \in S : y>x\}
$$
</details>
<br>


### Set Algebra

Let A and B be events defined over a sample space S

Then the union of A and B, writen as $A \cup B$, is the event whose outcomes belongs to either A or B or both

And the intersection of A and B, writen as $A \cap B$, is the event whose outcomes belongs to both A and B

The compliment of an event A, writen as $A^c$ is all elements in S that are not in event A.

**Example**
Let A be the event that you roll and even number on a 6-sided die and let B be the event that you roll higher than a 3.
$$
A \cup B = \{2,4,5,6\}\\
A \cap B = \{4,6\}\\
A^c = \{1,3,5\}
$$

*Definition:* Two events A and B are said to be **mutually exclusive** if $A \cap B = \emptyset$


### Axioms of Probability 

Axiom 1. Let A be any event defined over the sample space S. Then $P(A) \geq 0$

Axiom 2. $P(S) = 1$

Axiom 3. Let A and B be any two mutually exclusive events defined over S. Then
$$
P(A \cup B)=P(A)+P(B)
$$
<br>
*Theorems:* 
$$
P(A^c) = 1-P(A)
$$
$$
P(A \cup B) = P(A) + P(B) - P(A \cap B)
$$
<br>
*Tip:* Drawing venn diagrams can help when solving these types of problems
