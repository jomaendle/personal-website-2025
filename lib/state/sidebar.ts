import { atomWithStorage } from 'jotai/utils'

// Persistent sidebar state atoms with localStorage
export const sidebarMorePostsOpenAtom = atomWithStorage(
  'sidebar-more-posts-open',
  true // Default: More Posts section is open
)

export const sidebarOnThisPageOpenAtom = atomWithStorage(
  'sidebar-on-this-page-open', 
  false // Default: On This Page section is closed
)

// Optional: Atom to track if TOC should auto-expand (for first-time visitors)
export const tocAutoExpandEnabledAtom = atomWithStorage(
  'sidebar-toc-auto-expand',
  true // Default: allow auto-expansion for new visitors
)