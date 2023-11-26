# Getting started with Reinforcement Learning

This project provides a solution to a reinforcement learning problem.
The idea is to make it easy to getting started with reinforcement learning by starting with an example solution. 
Run the following commands to setup and run the project (on macOS). Then feel free to adjust, play around and
try to adapt it to solve other reinforcement learning problems or use other algorithms for solving.

## The problem: Lunar Landing

The problem this example project solves is called Lunar Landing. 
Read more about it here: [Lunar Lander]

## The solution: Deep Q Learning

This project solves the Lunar Landing problem using a reinforcement technique called "Deep Q Learning".
Read more about it [here ] and here [here].

## How to use

### Pre-requisites
```
brew install python@3.11
brew install pipx
pipx ensurepath
pipx install poetry
```

### Install
```
poetry env use 3.11
poetry install
```

### Run
```
poetry run python reinforce.py
```

[Lunar Lander]: https://gymnasium.farama.org/environments/box2d/lunar_lander/
[here ]: https://arxiv.org/pdf/1312.5602.pdf
[here]: https://arxiv.org/pdf/1509.06461.pdf