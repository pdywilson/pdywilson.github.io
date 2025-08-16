# Install

```
python3 -m pip install --user poetry
```

check where it installed via
```
python3 -m site --user-base
```

( e.g. /Users/paddy/Library/Python/3.9)

Then add that to path in .zshrc and source it, e.g:
```
echo 'export PATH="$HOME/Library/Python/3.9/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

install dependencies:
```
cd travel
poetry install
```

# Run

```
cd travel
poetry run python -m toml_site_generator.generate_site
```

