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
        
        # Policy network is used to predict the next action and is trained with backpropagation
        self.policy_network = nn.Sequential(
            nn.Linear(self.state_size, self.layer_size),
            nn.ReLU(),
            nn.Linear(self.layer_size, self.layer_size),
            nn.ReLU(),
            nn.Linear(self.layer_size, self.layer_size_last),
            nn.ReLU(),
            nn.Linear(self.layer_size_last, self.action_size),
        )
        
        # Target network is a separate copy of the policy network used to stabilize training.
        # It helps in the calculation of the target Q-values during the learning process. 
        # This network is not updated as frequently as the policy network.
        # The target network's parameters are periodically updated to match those of the policy network 
        # to provide more stable targets for Q-value estimation.
        self.target_network = nn.Sequential(
            nn.Linear(self.state_size, self.layer_size),
            nn.ReLU(),
            nn.Linear(self.layer_size, self.layer_size),
            nn.ReLU(),
            nn.Linear(self.layer_size, self.layer_size_last),
            nn.ReLU(),
            nn.Linear(self.layer_size_last, self.action_size),
        )
        
        self.optimizer = torch.optim.AdamW(self.policy_network.parameters(), lr=self.learning_rate)

    def memorize_experience(self, state, action, reward, next_state, done):
        self.replay_exp.append((state, action, reward, next_state, done))
    
    def choose_action(self, state):
        if np.random.uniform(0.0, 1.0) < self.epsilon:
            action = np.random.choice(self.action_size)
        else:
            state_tensor = torch.tensor(state, dtype=torch.float32)
            q_values = self.policy_network(state_tensor)
            action = torch.argmax(q_values).item()
            
        return action
     
    def learn(self):
        mini_batch = random.sample(self.replay_exp, self.batch_size)

        sample_states = np.array([exp[0] for exp in mini_batch])
        sample_actions = np.array([exp[1] for exp in mini_batch])
        sample_rewards = np.array([exp[2] for exp in mini_batch])
        sample_next_states = np.array([exp[3] for exp in mini_batch])
        sample_dones = np.array([exp[4] for exp in mini_batch])

        states = torch.tensor(sample_states, dtype=torch.float32) # torch.Size([64, 8])
        actions = torch.tensor(sample_actions, dtype=torch.int64) # torch.Size([64])
        rewards = torch.tensor(sample_rewards, dtype=torch.float32) # torch.Size([64])
        next_states = torch.tensor(sample_next_states, dtype=torch.float32) # torch.Size([64, 8])
        dones = torch.tensor(sample_dones, dtype=torch.float32) # torch.Size([64])
        
        # Network outputs 4 dim vec, likelihood of each action, we select likelihood of the likeliest action
        next_action_likelihoods = self.target_network(next_states).detach().max(1)[0] # torch.Size([64])
        # If action done -> target is reward only, else target is reward + weighted likelihood of predicted action
        q_targets = rewards + self.gamma * next_action_likelihoods * (1 - dones) # torch.Size([64])
        # Network outputs 4 dim vec, we gather the index of to the predicted action (.gather(1,...) gives index)
        q_expected = self.policy_network(states).gather(1, actions.unsqueeze(1)).flatten() # torch.Size([64])
                    
        self.optimizer.zero_grad()
        loss = nn.functional.mse_loss(q_expected, q_targets)
        loss.backward()
        self.optimizer.step()

        # copy the weights from policy_network to target_network, updating the target network
        # idea for future: consider only updating the fixed network every n episodes to avoid unstability due to chasing a moving target
        self.update_fixed_network(self.policy_network, self.target_network)
    
    def update_fixed_network(self, policy_network, target_network):
        for source_parameters, target_parameters in zip(policy_network.parameters(), target_network.parameters()):
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


# Main script
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

agent = Agent(wrapped_env, lr=learning_rate, batch_size=batch_size)
reward_over_episodes = []

for episode in range(episodes):
    state, info = wrapped_env.reset(seed=seed)
    done = False
    
    while not done:
        action = agent.choose_action(state)
        next_state, reward, terminated, truncated, info = wrapped_env.step(action)
        done = terminated or truncated
        agent.memorize_experience(state, action, reward, next_state, done)
        if len(agent.replay_exp) > agent.batch_size:
            agent.learn()
        state = next_state
    
    agent.epsilon = max(0.01, 0.99 * agent.epsilon) # decaying exploration

    reward_over_episodes.append(wrapped_env.return_queue[-1])

    if episode % 10 == 0 and episode != 0:
        avg_reward = int(np.mean(wrapped_env.return_queue))
        max_reward = int(max(reward_over_episodes)[0])
        print("Episode:", episode, "Epsilon:", "{:.2f}".format(agent.epsilon), "Average Reward:", avg_reward, "Max Reward:", max_reward)
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