import gymnasium as gym
import torch
import torch.nn as nn
import torch.optim as optim
import random
from collections import deque
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd

class Agent:
    def __init__(self, env, lr, batch_size):
        self.state_size = env.observation_space.shape[0]
        self.action_size = env.action_space.n
        self.learning_rate = lr
        self.batch_size = batch_size
        
        self.replay_exp = deque(maxlen=1000000)
        self.gamma = 0.99
        self.epsilon = 1.0
        self.TAU = 0.001
        self.layer_size = 64
        self.layer_size_last = 32
        
        self.brain_policy = nn.Sequential(
            nn.Linear(self.state_size, self.layer_size),
            nn.ReLU(),
            nn.Linear(self.layer_size, self.layer_size),
            nn.ReLU(),
            nn.Linear(self.layer_size, self.layer_size_last),
            nn.ReLU(),
            nn.Linear(self.layer_size_last, self.action_size),
        )
        
        self.brain_target = nn.Sequential(
            nn.Linear(self.state_size, self.layer_size),
            nn.ReLU(),
            nn.Linear(self.layer_size, self.layer_size),
            nn.ReLU(),
            nn.Linear(self.layer_size, self.layer_size_last),
            nn.ReLU(),
            nn.Linear(self.layer_size_last, self.action_size),
        )
        
        self.optimizer = torch.optim.AdamW(self.brain_policy.parameters(), lr=self.learning_rate)
        
        self.update_brain_target()

    def memorize_exp(self, state, action, reward, next_state, done):
        self.replay_exp.append((state, action, reward, next_state, done))
    
    def update_brain_target(self):
        self.brain_target.load_state_dict(self.brain_policy.state_dict())
    
    def choose_action(self, state):
        if np.random.uniform(0.0, 1.0) < self.epsilon:
            action = np.random.choice(self.action_size)
        else:
            state_tensor = torch.tensor(state, dtype=torch.float32)
            q_values = self.brain_policy(state_tensor)
            action = torch.argmax(q_values).item()
            
        return action
     
    def learn(self):
        mini_batch = random.sample(self.replay_exp, self.batch_size)

        sample_states = np.array([exp[0] for exp in mini_batch])
        sample_actions = np.array([exp[1] for exp in mini_batch])
        sample_rewards = np.array([exp[2] for exp in mini_batch])
        sample_next_states = np.array([exp[3] for exp in mini_batch])
        sample_dones = np.array([exp[4] for exp in mini_batch])

        states = torch.tensor(sample_states, dtype=torch.float32)
        actions = torch.tensor(sample_actions, dtype=torch.int64)
        rewards = torch.tensor(sample_rewards, dtype=torch.float32)
        next_states = torch.tensor(sample_next_states, dtype=torch.float32)
        dones = torch.tensor(sample_dones, dtype=torch.float32)
        print("states", states.size())
        print("actions", actions.size())
        print("rewards", rewards.size())
        print("next_states", next_states.size())
        print("dones", dones.size())
        
        next_actions = self.brain_target(next_states).detach().max(1)[0]
        q_targets = rewards + self.gamma * next_actions * (1 - dones)
        q_expected = self.brain_policy(states).gather(1, actions.unsqueeze(1)).flatten()
                    
        self.optimizer.zero_grad()
        loss = nn.functional.mse_loss(q_expected, q_targets)
        loss.backward()
        self.optimizer.step()

        # idea: consider only updating the fixed network every n episodes to avoid unstability due to chasing a moving target
        self.update_fixed_network(self.brain_policy, self.brain_target)
    
    def update_fixed_network(self, brain_policy, brain_target):
        for source_parameters, target_parameters in zip(brain_policy.parameters(), brain_target.parameters()):
            target_parameters.data.copy_(self.TAU * source_parameters.data + (1.0 - self.TAU) * target_parameters.data)

def rungame(agent):
    humanEnv = gym.make("LunarLander-v2", render_mode="human")
    observation, _ = humanEnv.reset(seed=seed)

    for _ in range(300):
        action = agent.choose_action(observation)
        observation, reward, terminated, truncated, _ = humanEnv.step(action)

        if terminated or truncated:
            observation, _ = humanEnv.reset()

    humanEnv.close()

# Initialize Gym environment and optimizer
env = gym.make("LunarLander-v2")
wrapped_env = gym.wrappers.RecordEpisodeStatistics(env)  # Records episode-reward

# Hyperparams
learning_rate = 0.01   # 0.01 works
batch_size = 64        # 64 works
seed = 3               # 3 works
episodes = 1000        # 1000

torch.manual_seed(seed)
random.seed(seed)
np.random.seed(seed)

# Create agent
agent = Agent(wrapped_env, lr=learning_rate, batch_size=batch_size)

reward_over_episodes = []

# Main script
for episode in range(episodes):
    state, info = wrapped_env.reset(seed=seed)
    done = False
    
    while not done:
        action = agent.choose_action(state)
        next_state, reward, terminated, truncated, info = wrapped_env.step(action)
        done = terminated or truncated
        agent.memorize_exp(state, action, reward, next_state, done)
        if len(agent.replay_exp) > agent.batch_size:
            agent.learn()
        state = next_state
    
    agent.epsilon = max(0.01, 0.99 * agent.epsilon) # decaying exploration

    reward_over_episodes.append(wrapped_env.return_queue[-1])

    if episode % 10 == 0 and episode != 0:
        avg_reward = int(np.mean(wrapped_env.return_queue))
        print("Episode:", episode, "Average Reward:", avg_reward, "Epsilon", agent.epsilon)

        max_reward = max(reward_over_episodes)
        print("Max Reward", max_reward)

        print("Running game")
        rungame(agent)
        print("Back to training")

rewards_to_plot = [[reward[0] for reward in rewards] for rewards in [reward_over_episodes]]
df1 = pd.DataFrame(rewards_to_plot).melt()
df1.rename(columns={"variable": "episodes", "value": "reward"}, inplace=True)
sns.set(style="darkgrid", context="talk", palette="rainbow")
sns.lineplot(x="episodes", y="reward", data=df1).set(
    title="REINFORCE for LunarLander-v2"
)
plt.show()