import { hero, feature, pricing, testimonial, ecommerce, footer, ctaBanner, blogArticle, contactForm, galleryPortfolio, header } from "./svg-assets";

const headerNames = [
  "Header Minimal",
  "Header Floating",
  "Header Center Logo",
  "Header Glass",
  "Header Dark",
  "Header Underline",
  "Header Boxed",
  "Header Gradient",
  "Header Sidebar",
  "Header Center CTA",
  "Header Thin",
  "Header Floating Gradient"
];

export const components = [
  ...hero.map((svg, i) => ({
    id: `hero-${i + 1}`,
    category: "Hero",
    name: `Hero Layout ${i + 1}`,
    svg
  })),
  ...header.map((svg, i) => ({
    id: `header-${i + 1}`,
    category: "Header",
    name: headerNames[i] || `Header ${i + 1}`,
    svg
  })),
  ...feature.map((svg, i) => ({
    id: `feature-${i + 1}`,
    category: "Features",
    name: `Feature Grid ${i + 1}`,
    svg
  })),
  ...pricing.map((svg, i) => ({
    id: `pricing-${i + 1}`,
    category: "Pricing",
    name: `Pricing Tier ${i + 1}`,
    svg
  })),
  ...testimonial.map((svg, i) => ({
    id: `testimonial-${i + 1}`,
    category: "Testimonials",
    name: `Testimonial Layout ${i + 1}`,
    svg
  })),
  ...ecommerce.map((svg, i) => ({
    id: `ecommerce-${i + 1}`,
    category: "Ecommerce",
    name: `Product Layout ${i + 1}`,
    svg
  })),
  ...footer.map((svg, i) => ({
    id: `footer-${i + 1}`,
    category: "Footer",
    name: `Footer Layout ${i + 1}`,
    svg
  })),
  ...ctaBanner.map((svg, i) => ({
    id: `cta-${i + 1}`,
    category: "CTA/Banner",
    name: `CTA Banner ${i + 1}`,
    svg
  })),
  ...blogArticle.map((svg, i) => ({
    id: `blog-${i + 1}`,
    category: "Blog/Article",
    name: `Blog Layout ${i + 1}`,
    svg
  })),
  ...contactForm.map((svg, i) => ({
    id: `contact-${i + 1}`,
    category: "Contact/Form",
    name: `Contact Form ${i + 1}`,
    svg
  })),
  ...galleryPortfolio.map((svg, i) => ({
    id: `gallery-${i + 1}`,
    category: "Gallery/Portfolio",
    name: `Gallery Layout ${i + 1}`,
    svg
  }))
];