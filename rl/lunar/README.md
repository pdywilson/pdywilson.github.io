# Install
brew install python@3.11
brew install pipx
pipx ensurepath
pipx install poetry
poetry env use 3.11
poetry add [each package]

# Run
poetry run python reinforce.py