export const blogPosts: {
    title: string;
    date: string;
    link: string;
    slug: string;
}[] = [
    {
        title: "Animating Gradients in CSS",
        date: "Dec 5, 2023",
        link: "/blog/animations",
        slug: "animations",
    },
    {
        title: "Making Responsive UI Components with display: contents",
        date: "Sep 15, 2024",
        link: "/blog/responsive-ui-components",
        slug: "responsive-ui-components",
    },
    {
        title: "Aligning Dates in Tabular Data",
        date: "Sep 29, 2024",
        link: "/blog/align-dates-in-tables",
        slug: "align-dates-in-tables",
    },
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
