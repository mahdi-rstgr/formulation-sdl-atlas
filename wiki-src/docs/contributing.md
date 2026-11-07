# Contributing

We welcome contributions from the community to keep this wiki accurate and up to date.

## Ways to Contribute

- Fix errors or outdated information
- Add missing technologies or references
- Improve clarity of existing pages
- Add new subsections for emerging methods

## How to Contribute

1. Click the **Edit this page** button (pencil icon, top right of any page).
2. This opens the file on GitHub. Sign in and click **Fork this repository**.
3. Make your changes in the Markdown file.
4. Submit a **Pull Request** with a brief description of what you changed and why.

## Content Guidelines

- Keep descriptions concise and factual.
- Cite primary sources (journal articles, manufacturer documentation). Numbered citations such as [\[11\]](references.md#ref-11) refer to the review's reference list on the [References](references.md) page; link them as `[\[11\]](references.md#ref-11)`.
- Accuracy and price figures should match the review (V3) or state their own source and date.
- Use the existing page structure (Overview → Technologies → Comparison → References).
- Avoid promotional language.

## Local Development

To preview the site locally before submitting:

```
pip install mkdocs-material
cd wiki-src
mkdocs serve
```

The built site is published from the `wiki/` folder of the repository (`mkdocs build --site-dir ../wiki`).

Then open <http://127.0.0.1:8000> in your browser.

## Contact

Open a [GitHub Issue](https://github.com/mahdi-rstgr/formulation-sdl-atlas/issues) for questions or suggestions.
