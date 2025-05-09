# Nuxt 3 WordPress Starter with Post Previews

This project provides a starting point for using [Nuxt 3](https://nuxt.com/) with WordPress as a headless CMS, featuring a post preview system for content editors.

## Features

- **Post Previews**: View WordPress draft content directly in your Nuxt frontend before publishing
- **Authentication**: Secure preview system using Faust.js authentication

## Requirements

- a WordPress site with:
- [WPGraphQL](https://www.wpgraphql.com) plugin
- [FaustWP](https://faustjs.org/) plugin for authentication

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Fran-A-Dev/nuxt3-headlesswp-post-previews.git

cd nuxt-wordpress-starter
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```
WORDPRESS_URL=https://yourwordpresssite.com/graphql
FRONTEND_URL=http://localhost:3000
FAUST_SECRET_KEY=your_faust_secret_key
```

- `WORDPRESS_URL`: Your WordPress GraphQL endpoint
- `FRONTEND_URL`: The URL where your Nuxt app is running
- `FAUST_SECRET_KEY`: Secret key from your WordPress FaustWP plugin settings

### 4. Run the development server

```bash
npm run dev
```

Your site will be available at http://localhost:3000

## Using Post Previews

1. **In WordPress**: Create or edit a post, then click "Preview" in the editor
2. You'll be redirected to your Nuxt frontend with the preview content
3. Make changes in WordPress, click "Preview" again to see updates

The preview system handles authentication automatically, allowing content editors to see unpublished content while keeping it secure from public access.

## Deployment

Build your application for production:

```bash
npm run build
```

Deploy the generated output:

```bash
npm run start
```
