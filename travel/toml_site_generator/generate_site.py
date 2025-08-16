import toml

# Load TOML content
with open("content.toml", "r") as f:
    data = toml.load(f)

# Start HTML
html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My travels</title>
    <link rel="stylesheet" type="text/css" href="css/travel.css">
    <script src="js/travel.js"></script>
</head>
<body><div class="timeline">
"""

# Iterate through timeline by year
for year_block in data.get("timeline", []):
    # Add year node
    html += f'''
    <div class="year-node">
        <div class="content">
            {year_block["year"]}
        </div>
    </div>
    <div></div>
'''
    for item in year_block.get("items", []):
        image = item.get("image", "")
        if image.strip():
            image_html = f'<img src="{image}" alt="{item["title"]}">'
        else:
            image_html = "🌴"  # fallback

        html += f'''
        <div class="timeline-item">
            <div class="content">
                {image_html}
                <h3>{item['title']}</h3>
            </div>
        </div>
'''

# End HTML
html += """
</div>
</body>
</html>
"""

# Write to output file
with open("../travel.html", "w") as f:
    f.write(html)

print("index.html generated successfully.")
