<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- The site is the migrated Mobixgen export: original prerendered HTML lives in src/content and is served verbatim by src/routes/index.tsx and src/routes/$.tsx server handlers; its assets live in public/assets and public/media. Why: preserves the original site exactly.
