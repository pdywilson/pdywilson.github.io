---
title: paddy
layout: page
---

# a collection of cool python code

#### Definitions.
* Data Mining = ML + other techniques (not just learning), Data Science = full process of working with data
* Good Data Science: Overfitting, model selection, cross validation, significance of results, error bars, touch test set once

## General.

# import data
import pandas as pd
from sklearn.model_selection import train_test_split
df = pd.read_csv('data/ozone.csv')
data = df.as_matrix().astype(np.float32)
X, y = data[:, 1:], data[:, 0]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.90, random_state=798)

# pairwise distances
from scipy.spatial.distance import pdist

# randomness
#v = (np.random.rand(25000,r) - 0.5) * 2
#v = np.random.normal(0, 1, (X.shape[1],r))
#v = np.reshape(v, (X.shape[1], r))
#fastest:
v = (np.random.randint(0,2,size=(25000,r)) - 0.5) * 2
#v = np.random.uniform(-1, 1, (25000, r))
#v = (np.random.randn(25000,r) - 0.5) * 2
x = X @ v

# hashbuckets
signatureMatrix = (x >= 0) * 1

powersTwo = 1 << np.arange(r - 1, -1, -1)

hashedBuckets = signatureMatrix @ powersTwo

# anything sparse -> task02 mmd

# vector multiplies matrix rows easily:
np.diag(a) @ A @ np.diag(b * c)

## images

# open image
import imageio
import matplotlib.pyplot as plt
impath = './images/p1.png'
I1 = np.array(imageio.imread(impath1)).astype(np.float64)
#plt.imshow(I1)

# open all images GREYSCALE
c = 0
l = []
for fname in os.listdir(curr_folder):
    c = c+1
    l.append(np.array(imageio.imread(curr_folder+fname)).flatten())
    if c>999:
        c=0
        break
data = np.array(l)
data = data/255

# lots of color labels, numbers = number of classes (e.g. 3 for first three mnist numbers), N is # samples
rgb_label = np.array([[0, 0, 1], [0, 1, 0], [1, 0, 0], [1, 1, 0], [1, 0, 1], [0, 1, 1], [0.3, 0.1, 0], [1, 1, 0.3], [0.25, 1, 1], [1, 0.7, 0.9]])
C = np.repeat(rgb_label[:numbers,:],np.repeat(N,numbers),axis=0)
# example: plt.scatter(S[0],S[1],c=C)

# rgb to grey
def rgb2gray(rgb):

    r, g, b = rgb[:,:,0], rgb[:,:,1], rgb[:,:,2]
    gray = 0.2989 * r + 0.5870 * g + 0.1140 * b

    return gray

## sound

# load sound
y, sr = librosa.load("scary_indie.mp3", sr = None)
segment = y[24*sr:25*sr]
IPython.display.display(IPython.display.Audio(segment, rate=sr))
