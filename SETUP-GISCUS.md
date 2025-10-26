# Giscus Comments Setup Guide

This guide covers the setup for GitHub Discussions-powered comments on your blog using Giscus.

## ✅ Already Implemented

- Giscus comments component integrated into blog layout
- Dark theme matching your design system
- Configured for `jomaendle/personal-website-2025` repository
- Category: "Blog Comments"
- Privacy-first: No tracking, GDPR compliant, zero ads

---

## 📋 What is Giscus?

Giscus is a comments system powered by GitHub Discussions:
- **Free & open source**
- **Zero tracking or analytics**
- **Built-in reactions** (👍 ❤️ 🎉 😕 🚀 👀)
- **Threaded replies**
- **Markdown support** with code syntax highlighting
- **GitHub authentication** (spam-resistant)

---

## ✨ Already Configured

The component at `components/giscus-comments.tsx` is already set up with:

```javascript
data-repo: "jomaendle/personal-website-2025"
data-repo-id: "R_kgDONtoXmg"
data-category: "Blog Comments"
data-category-id: "DIC_kwDONtoXms4CxD2c"
data-theme: "dark"
```

---

## 🎨 Customization Options

### Change Theme

In `components/giscus-comments.tsx:30`, you can modify:
```javascript
script.setAttribute("data-theme", "dark");
```

**Available themes:**
- `dark` - Dark theme (current)
- `light` - Light theme
- `preferred_color_scheme` - Auto-detect user preference
- Custom theme URL - See [Giscus Advanced Usage](https://github.com/giscus/giscus/blob/main/ADVANCED-USAGE.md#data-theme)

### Change Comment Position

In `components/giscus-comments.tsx:29`:
```javascript
script.setAttribute("data-input-position", "top");
```

Options: `top` or `bottom`

### Disable Reactions

In `components/giscus-comments.tsx:27`:
```javascript
script.setAttribute("data-reactions-enabled", "1");
```

Change `"1"` to `"0"` to disable reactions

---

## 🔧 How It Works

1. **User visits a blog post**
2. **Giscus loads** at the bottom of the post
3. **User clicks "Sign in with GitHub"** to comment
4. **Comment is stored** as a GitHub Discussion in your repository
5. **Discussion thread** is mapped to the blog post slug

Each blog post has its own unique discussion thread based on the post's slug.

---

## 🔒 Privacy Features

- **No tracking pixels or analytics**
- **No ads or third-party scripts**
- **GitHub OAuth** for authentication (no separate account)
- **Self-hosted discussions** in your repository
- **GDPR compliant** out of the box

---

## 🐛 Troubleshooting

### Comments Not Loading

1. **Check Giscus app is installed**: Visit https://github.com/apps/giscus and verify it's installed on your repo
2. **Verify Discussions are enabled**: Go to repo Settings > Features > Check "Discussions"
3. **Confirm category exists**: Visit your repo's Discussions tab and ensure "Blog Comments" category exists
4. **Check browser console**: Look for Giscus-specific errors

### Wrong Discussion Category

If comments are appearing in the wrong category, verify the `data-category-id` in `components/giscus-comments.tsx:23` matches your "Blog Comments" category.

To get the correct ID:
1. Visit https://giscus.app
2. Enter your repo: `jomaendle/personal-website-2025`
3. Select category: "Blog Comments"
4. Copy the generated `data-category-id`

### Styling Issues

Giscus uses an iframe with dark theme. If you need custom styling, see the [Giscus theming guide](https://github.com/giscus/giscus/blob/main/ADVANCED-USAGE.md#custom-theme).

---

## 📚 Resources

- [Giscus Homepage](https://giscus.app)
- [Giscus GitHub Repository](https://github.com/giscus/giscus)
- [Giscus Advanced Usage](https://github.com/giscus/giscus/blob/main/ADVANCED-USAGE.md)
- [GitHub Discussions Documentation](https://docs.github.com/en/discussions)

---

## 🎉 You're All Set!

Your blog now has a fully functional, privacy-first commenting system. Readers can:
- Leave comments and replies
- React with emojis (👍 ❤️ 🎉 😕 🚀 👀)
- Use markdown formatting
- Get notifications for replies (via GitHub)

All comments are stored in your repository's Discussions, giving you complete ownership and control.
