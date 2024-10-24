# Publishing packages (internal use!)

We have a monorepo structure, hence use lerna to publish. At the moment, publishing is done manually,
later this will be automated by pushing a tag and using github actions. This still requires unit-testing to not publish BS.

1. We stick to the semantic versioning.
   1. All packages will always have the same version number.
   1. The published commit will be tagged as `vX.Y.Z` in this repository, if the version number is `X.Y.Z`
   1. Later we will automate publishing based on this git-tag
1. Ensure your versions in packages/*/package.json are what you want to publish
1. Run `npx lerna run build` (or `yarn build` for convenience)
1. Check status of changes via `npx lerna changed`
1. It is a good idea to check the packages locally before with boilerplate (TODO!) and `npm link`
1. If boilerplate and all tests look fine, use `npx lerna publish`.
   1. You may need to `npm login` before.
