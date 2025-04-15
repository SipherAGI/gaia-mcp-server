# [1.3.0-dev.1](https://github.com/SipherAGI/gaia-mcp-server/compare/v1.2.0...v1.3.0-dev.1) (2025-04-15)


### Features

* update package version retrieval in gaia-mcp-server ([09e5e7c](https://github.com/SipherAGI/gaia-mcp-server/commit/09e5e7cfde27d8af689d7eb66938e67a7ac5b93e))

# [1.2.0](https://github.com/SipherAGI/gaia-mcp-server/compare/v1.1.1...v1.2.0) (2025-04-15)


### Bug Fixes

* improve error handling and update timeout message ([c09927e](https://github.com/SipherAGI/gaia-mcp-server/commit/c09927ee381e8288fc944a7b1c52fd5475ba75a1))
* update API request timeout to 60 seconds ([131f0d1](https://github.com/SipherAGI/gaia-mcp-server/commit/131f0d121eb801ebfd476c0d1a2947fc6f597156))


### Features

* add new prompt styles and aspect ratios for image generation ([344fbee](https://github.com/SipherAGI/gaia-mcp-server/commit/344fbee05dce24ca1eab1dfafd55beb2671d0ca7))

## [1.1.1](https://github.com/SipherAGI/gaia-mcp-server/compare/v1.1.0...v1.1.1) (2025-04-14)


### Bug Fixes

* update README with GAIA credits note and license change ([4bdd305](https://github.com/SipherAGI/gaia-mcp-server/commit/4bdd3059993bea8282326d863f76120396e1c98d))

# [1.1.0](https://github.com/SipherAGI/gaia-mcp-server/compare/v1.0.1...v1.1.0) (2025-04-14)


### Bug Fixes

* **docs:** update DEVELOPMENT.md and README.md with local development setup and Redis integration details ([f1dabe1](https://github.com/SipherAGI/gaia-mcp-server/commit/f1dabe19e0c884c7facd5beb369997fdf95965e1))


### Features

* enhance integration guide for Gaia MCP Server with Claude Desktop ([687c865](https://github.com/SipherAGI/gaia-mcp-server/commit/687c865d3cbea3cc0976782cb0ec75dbf2c1fa1e))

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.0.1](https://atherlabs.github.com/SipherAGI/gaia-mcp-server/compare/v1.0.0...v1.0.1) (2025-04-14)

## 1.0.0 (2025-04-14)


### Features

* add API client for image uploads and related utilities ([0e88838](https://atherlabs.github.com/SipherAGI/gaia-mcp-server/commit/0e88838b65667d3d4ff707a2b809eb5e87fee8db))
* add development guide and nodemon configuration ([cef717b](https://atherlabs.github.com/SipherAGI/gaia-mcp-server/commit/cef717bf15e5582457f98763451bd928f1514ee7))
* add Docker support with Dockerfile and docker-compose configuration ([06ac30b](https://atherlabs.github.com/SipherAGI/gaia-mcp-server/commit/06ac30b8e2568b53d9bc1410c09ee9db5013cf2a))
* add Redis integration and configuration to Gaia MCP server ([155a3f9](https://atherlabs.github.com/SipherAGI/gaia-mcp-server/commit/155a3f98d2806f5f91dcccc475232ec65d014b16))
* add supported tools section to README ([186590e](https://atherlabs.github.com/SipherAGI/gaia-mcp-server/commit/186590e358ed43c5ec6042b16776820e31a7baff))
* add upscaler tool for image resolution enhancement ([da2b09b](https://atherlabs.github.com/SipherAGI/gaia-mcp-server/commit/da2b09b877b11915b709090991aab805f8e0a3cb))
* **config:** add AWS Parameter Store integration with profile support ([2beb899](https://atherlabs.github.com/SipherAGI/gaia-mcp-server/commit/2beb899a49f07fa7118c4f908f1f8c18a4aa58e8))
* **config:** enhance Redis configuration handling and logging ([0306294](https://atherlabs.github.com/SipherAGI/gaia-mcp-server/commit/0306294501b2a428f4d60ea7ba110f599fb3a59f))
* **docs:** add integration guide for Gaia MCP Server with Claude Desktop ([a197f92](https://atherlabs.github.com/SipherAGI/gaia-mcp-server/commit/a197f927e547c623e8a9c6e41cd89039a88ea4be))
* enhance ApiClient with detailed documentation and type annotations ([cc0be53](https://atherlabs.github.com/SipherAGI/gaia-mcp-server/commit/cc0be53fd4cb20b10264083b5757bbe6bdbee7a2))
* enhance image upload functionality and logging ([b597735](https://atherlabs.github.com/SipherAGI/gaia-mcp-server/commit/b59773514bb1ca6557fc3c2ee6ad71ad725efd5f))
* **error-handling:** enhance error messages for timeout scenarios in image processing tools ([fc12d01](https://atherlabs.github.com/SipherAGI/gaia-mcp-server/commit/fc12d019fbb79a3174f2f682e64bb99540c41dfd))
* **formatter:** introduce imageResponseFormatter for consistent image response messaging ([7b127cf](https://atherlabs.github.com/SipherAGI/gaia-mcp-server/commit/7b127cfc178460fa3371304603c1fc72f3e82f85))
* **image-processing:** integrate sharp for image resizing and enhance image response handling ([cdda4e2](https://atherlabs.github.com/SipherAGI/gaia-mcp-server/commit/cdda4e24577805192518e5a27d3a80214ce28a12))
* implement image generation and enhancement tools ([5dbb9ad](https://atherlabs.github.com/SipherAGI/gaia-mcp-server/commit/5dbb9adbbc69193fee5b0bc336ccfce988a1d24e))
* implement logging functionality ([1c26892](https://atherlabs.github.com/SipherAGI/gaia-mcp-server/commit/1c26892cac36272284ddbbe205020adfef36f363))
* integrate Gaia API configuration into MCP server and tools ([208a6a0](https://atherlabs.github.com/SipherAGI/gaia-mcp-server/commit/208a6a04ecdc91dd90edaf1313282ad09cc70bcf))
* **logging:** enhance logging and timeout configuration in ApiClient and tools ([9ed0c7c](https://atherlabs.github.com/SipherAGI/gaia-mcp-server/commit/9ed0c7c33215d859b469d32b9dc36821aeee03cf))
* **logging:** improve logger configuration and server transport handling ([fb2b986](https://atherlabs.github.com/SipherAGI/gaia-mcp-server/commit/fb2b9865aa5a688f84aecfc715df3b972e0dc6bc))
* **logging:** improve Redis configuration logging in SSE and GaiaMcpServer ([1a3e47a](https://atherlabs.github.com/SipherAGI/gaia-mcp-server/commit/1a3e47a79232ed2e612db8b6ba9a1decf4023a95))
* setup ESLint and Prettier with auto-fix ([cd14171](https://atherlabs.github.com/SipherAGI/gaia-mcp-server/commit/cd14171d80b5b79076a9928c58e30ab15cc6a0f1))
* update README and add RELEASE.md for release process documentation ([45a3ddf](https://atherlabs.github.com/SipherAGI/gaia-mcp-server/commit/45a3ddf3dc96c9ea6fd6a8c287f1e69a559de94e))


### Bug Fixes

* **docker:** build ([b522762](https://atherlabs.github.com/SipherAGI/gaia-mcp-server/commit/b5227627c55c15e6675a1e0fe852d0f171d78d13))
* **docker:** build ([09add28](https://atherlabs.github.com/SipherAGI/gaia-mcp-server/commit/09add28fe7212ae657b0d766d26a9f60ab0b0c4b))
* **docs:** update steps for generating API key in integration guide ([2ba357e](https://atherlabs.github.com/SipherAGI/gaia-mcp-server/commit/2ba357e043952704f2dca9d006ad694b132aef07))
* **logger:** update log file naming convention ([8b0d4bc](https://atherlabs.github.com/SipherAGI/gaia-mcp-server/commit/8b0d4bc2cd2b9e186b58ac0694d7f83b35294ce4))

# 1.0.0 (2025-04-14)


### Bug Fixes

* **docker:** build ([b522762](https://github.com/SipherAGI/gaia-mcp-server/commit/b5227627c55c15e6675a1e0fe852d0f171d78d13))
* **docker:** build ([09add28](https://github.com/SipherAGI/gaia-mcp-server/commit/09add28fe7212ae657b0d766d26a9f60ab0b0c4b))
* **docs:** update steps for generating API key in integration guide ([2ba357e](https://github.com/SipherAGI/gaia-mcp-server/commit/2ba357e043952704f2dca9d006ad694b132aef07))
* **logger:** update log file naming convention ([8b0d4bc](https://github.com/SipherAGI/gaia-mcp-server/commit/8b0d4bc2cd2b9e186b58ac0694d7f83b35294ce4))


### Features

* add API client for image uploads and related utilities ([0e88838](https://github.com/SipherAGI/gaia-mcp-server/commit/0e88838b65667d3d4ff707a2b809eb5e87fee8db))
* add development guide and nodemon configuration ([cef717b](https://github.com/SipherAGI/gaia-mcp-server/commit/cef717bf15e5582457f98763451bd928f1514ee7))
* add Docker support with Dockerfile and docker-compose configuration ([06ac30b](https://github.com/SipherAGI/gaia-mcp-server/commit/06ac30b8e2568b53d9bc1410c09ee9db5013cf2a))
* add Redis integration and configuration to Gaia MCP server ([155a3f9](https://github.com/SipherAGI/gaia-mcp-server/commit/155a3f98d2806f5f91dcccc475232ec65d014b16))
* add supported tools section to README ([186590e](https://github.com/SipherAGI/gaia-mcp-server/commit/186590e358ed43c5ec6042b16776820e31a7baff))
* add upscaler tool for image resolution enhancement ([da2b09b](https://github.com/SipherAGI/gaia-mcp-server/commit/da2b09b877b11915b709090991aab805f8e0a3cb))
* **config:** add AWS Parameter Store integration with profile support ([2beb899](https://github.com/SipherAGI/gaia-mcp-server/commit/2beb899a49f07fa7118c4f908f1f8c18a4aa58e8))
* **config:** enhance Redis configuration handling and logging ([0306294](https://github.com/SipherAGI/gaia-mcp-server/commit/0306294501b2a428f4d60ea7ba110f599fb3a59f))
* **docs:** add integration guide for Gaia MCP Server with Claude Desktop ([a197f92](https://github.com/SipherAGI/gaia-mcp-server/commit/a197f927e547c623e8a9c6e41cd89039a88ea4be))
* enhance ApiClient with detailed documentation and type annotations ([cc0be53](https://github.com/SipherAGI/gaia-mcp-server/commit/cc0be53fd4cb20b10264083b5757bbe6bdbee7a2))
* enhance image upload functionality and logging ([b597735](https://github.com/SipherAGI/gaia-mcp-server/commit/b59773514bb1ca6557fc3c2ee6ad71ad725efd5f))
* **error-handling:** enhance error messages for timeout scenarios in image processing tools ([fc12d01](https://github.com/SipherAGI/gaia-mcp-server/commit/fc12d019fbb79a3174f2f682e64bb99540c41dfd))
* **formatter:** introduce imageResponseFormatter for consistent image response messaging ([7b127cf](https://github.com/SipherAGI/gaia-mcp-server/commit/7b127cfc178460fa3371304603c1fc72f3e82f85))
* **image-processing:** integrate sharp for image resizing and enhance image response handling ([cdda4e2](https://github.com/SipherAGI/gaia-mcp-server/commit/cdda4e24577805192518e5a27d3a80214ce28a12))
* implement image generation and enhancement tools ([5dbb9ad](https://github.com/SipherAGI/gaia-mcp-server/commit/5dbb9adbbc69193fee5b0bc336ccfce988a1d24e))
* implement logging functionality ([1c26892](https://github.com/SipherAGI/gaia-mcp-server/commit/1c26892cac36272284ddbbe205020adfef36f363))
* integrate Gaia API configuration into MCP server and tools ([208a6a0](https://github.com/SipherAGI/gaia-mcp-server/commit/208a6a04ecdc91dd90edaf1313282ad09cc70bcf))
* **logging:** enhance logging and timeout configuration in ApiClient and tools ([9ed0c7c](https://github.com/SipherAGI/gaia-mcp-server/commit/9ed0c7c33215d859b469d32b9dc36821aeee03cf))
* **logging:** improve logger configuration and server transport handling ([fb2b986](https://github.com/SipherAGI/gaia-mcp-server/commit/fb2b9865aa5a688f84aecfc715df3b972e0dc6bc))
* **logging:** improve Redis configuration logging in SSE and GaiaMcpServer ([1a3e47a](https://github.com/SipherAGI/gaia-mcp-server/commit/1a3e47a79232ed2e612db8b6ba9a1decf4023a95))
* setup ESLint and Prettier with auto-fix ([cd14171](https://github.com/SipherAGI/gaia-mcp-server/commit/cd14171d80b5b79076a9928c58e30ab15cc6a0f1))
* update README and add RELEASE.md for release process documentation ([45a3ddf](https://github.com/SipherAGI/gaia-mcp-server/commit/45a3ddf3dc96c9ea6fd6a8c287f1e69a559de94e))

# 1.0.0 (2025-04-14)


### Bug Fixes

* **docker:** build ([b522762](https://github.com/SipherAGI/gaia-mcp-server/commit/b5227627c55c15e6675a1e0fe852d0f171d78d13))
* **docker:** build ([09add28](https://github.com/SipherAGI/gaia-mcp-server/commit/09add28fe7212ae657b0d766d26a9f60ab0b0c4b))
* **docs:** update steps for generating API key in integration guide ([2ba357e](https://github.com/SipherAGI/gaia-mcp-server/commit/2ba357e043952704f2dca9d006ad694b132aef07))
* **logger:** update log file naming convention ([8b0d4bc](https://github.com/SipherAGI/gaia-mcp-server/commit/8b0d4bc2cd2b9e186b58ac0694d7f83b35294ce4))


### Features

* add API client for image uploads and related utilities ([0e88838](https://github.com/SipherAGI/gaia-mcp-server/commit/0e88838b65667d3d4ff707a2b809eb5e87fee8db))
* add development guide and nodemon configuration ([cef717b](https://github.com/SipherAGI/gaia-mcp-server/commit/cef717bf15e5582457f98763451bd928f1514ee7))
* add Docker support with Dockerfile and docker-compose configuration ([06ac30b](https://github.com/SipherAGI/gaia-mcp-server/commit/06ac30b8e2568b53d9bc1410c09ee9db5013cf2a))
* add Redis integration and configuration to Gaia MCP server ([155a3f9](https://github.com/SipherAGI/gaia-mcp-server/commit/155a3f98d2806f5f91dcccc475232ec65d014b16))
* add supported tools section to README ([186590e](https://github.com/SipherAGI/gaia-mcp-server/commit/186590e358ed43c5ec6042b16776820e31a7baff))
* add upscaler tool for image resolution enhancement ([da2b09b](https://github.com/SipherAGI/gaia-mcp-server/commit/da2b09b877b11915b709090991aab805f8e0a3cb))
* **config:** add AWS Parameter Store integration with profile support ([2beb899](https://github.com/SipherAGI/gaia-mcp-server/commit/2beb899a49f07fa7118c4f908f1f8c18a4aa58e8))
* **config:** enhance Redis configuration handling and logging ([0306294](https://github.com/SipherAGI/gaia-mcp-server/commit/0306294501b2a428f4d60ea7ba110f599fb3a59f))
* **docs:** add integration guide for Gaia MCP Server with Claude Desktop ([a197f92](https://github.com/SipherAGI/gaia-mcp-server/commit/a197f927e547c623e8a9c6e41cd89039a88ea4be))
* enhance ApiClient with detailed documentation and type annotations ([cc0be53](https://github.com/SipherAGI/gaia-mcp-server/commit/cc0be53fd4cb20b10264083b5757bbe6bdbee7a2))
* enhance image upload functionality and logging ([b597735](https://github.com/SipherAGI/gaia-mcp-server/commit/b59773514bb1ca6557fc3c2ee6ad71ad725efd5f))
* **error-handling:** enhance error messages for timeout scenarios in image processing tools ([fc12d01](https://github.com/SipherAGI/gaia-mcp-server/commit/fc12d019fbb79a3174f2f682e64bb99540c41dfd))
* **formatter:** introduce imageResponseFormatter for consistent image response messaging ([7b127cf](https://github.com/SipherAGI/gaia-mcp-server/commit/7b127cfc178460fa3371304603c1fc72f3e82f85))
* **image-processing:** integrate sharp for image resizing and enhance image response handling ([cdda4e2](https://github.com/SipherAGI/gaia-mcp-server/commit/cdda4e24577805192518e5a27d3a80214ce28a12))
* implement image generation and enhancement tools ([5dbb9ad](https://github.com/SipherAGI/gaia-mcp-server/commit/5dbb9adbbc69193fee5b0bc336ccfce988a1d24e))
* implement logging functionality ([1c26892](https://github.com/SipherAGI/gaia-mcp-server/commit/1c26892cac36272284ddbbe205020adfef36f363))
* integrate Gaia API configuration into MCP server and tools ([208a6a0](https://github.com/SipherAGI/gaia-mcp-server/commit/208a6a04ecdc91dd90edaf1313282ad09cc70bcf))
* **logging:** enhance logging and timeout configuration in ApiClient and tools ([9ed0c7c](https://github.com/SipherAGI/gaia-mcp-server/commit/9ed0c7c33215d859b469d32b9dc36821aeee03cf))
* **logging:** improve logger configuration and server transport handling ([fb2b986](https://github.com/SipherAGI/gaia-mcp-server/commit/fb2b9865aa5a688f84aecfc715df3b972e0dc6bc))
* **logging:** improve Redis configuration logging in SSE and GaiaMcpServer ([1a3e47a](https://github.com/SipherAGI/gaia-mcp-server/commit/1a3e47a79232ed2e612db8b6ba9a1decf4023a95))
* setup ESLint and Prettier with auto-fix ([cd14171](https://github.com/SipherAGI/gaia-mcp-server/commit/cd14171d80b5b79076a9928c58e30ab15cc6a0f1))
