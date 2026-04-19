# Design System Document

## 1. Overview & Creative North Star: "The Cinematic Gallery"
This design system is engineered to transform a standard portfolio into a high-end editorial experience. The Creative North Star is **The Cinematic Gallery**—a philosophy where the interface recedes to let the media breathe, acting as a sophisticated stage rather than a container. 

We break the "template" look by rejecting rigid, boxy layouts in favor of intentional asymmetry and high-contrast typography scales. The goal is to create a digital space that feels curated, not just populated. We treat every screen as a composition, using depth and tonal shifts to guide the eye without the need for traditional structural lines.

## 2. Colors: Tonal Depth & The "No-Line" Rule
The palette is rooted in deep atmospherics. It utilizes a dark, sophisticated foundation to make high-resolution colors in videos and photos pop.

*   **The "No-Line" Rule:** To achieve a premium editorial feel, designers are strictly prohibited from using 1px solid borders to define sections. Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section should sit directly against a `surface` background to create a soft, seamless transition.
*   **Surface Hierarchy:** Depth is created through nesting. 
    *   **Level 0 (Base):** `surface` (#10131b) for the main canvas.
    *   **Level 1 (Sections):** `surface-container-low` for large content blocks.
    *   **Level 2 (Interactive):** `surface-container-high` for cards or hovered states.
*   **The "Glass & Gradient" Rule:** Floating elements (like navigation bars or video controls) must utilize a glassmorphic effect. Use a semi-transparent `surface-variant` with a `backdrop-blur` of 20px. 
*   **Signature Textures:** For primary calls to action or hero section overlays, use a subtle radial gradient transitioning from `primary` (#b8c7e5) to `primary-container` (#1b2a41) at a 45-degree angle. This provides a "soul" to the UI that flat color cannot replicate.

## 3. Typography: Editorial Authority
The typography system uses a sophisticated mix of sans-serif and serif to convey a "Digital Curator" persona.

*   **Display & Headlines (Space Grotesk):** These are our "statements." Use `display-lg` for hero titles with tight letter-spacing (-0.02em). These should feel architectural and bold.
*   **Titles & Body (Inter):** Our workhorse. Used for descriptions and interface elements. It provides a clean, modern counter-balance to the dramatic headlines.
*   **The Serif Accent (Lora):** While not in the primary token scale, use Lora (from the brand profile) for "Editorial Notes" or pull-quotes to add a layer of prestige and history to the modern layout.
*   **Labels (Manrope):** Use `label-md` for metadata (dates, categories). Increase letter-spacing to 0.1em and use all-caps to create a technical, "gallery-tag" aesthetic.

## 4. Elevation & Depth: Tonal Layering
In this design system, elevation is not about "lifting" an object off the page with a shadow; it is about **stacking layers of light.**

*   **The Layering Principle:** Avoid the "pasted-on" look. Depth is achieved by placing a `surface-container-lowest` card inside a `surface-container-low` section. This creates a natural "recessed" or "lifted" look based on the tonal value.
*   **Ambient Shadows:** When a floating effect is required (e.g., a modal), use an extra-diffused shadow.
    *   *Blur:* 40px–60px.
    *   *Opacity:* 4%–8%.
    *   *Color:* Use a tinted version of `on-surface` rather than pure black to mimic natural light behavior.
*   **The "Ghost Border" Fallback:** If a container requires a boundary for accessibility, use a "Ghost Border." Apply the `outline-variant` token at 15% opacity. Never use 100% opaque borders.

## 5. Components: Minimalist Primitives

### Buttons
*   **Primary:** No borders. Use `primary` background with `on-primary` text. Sizing should be generous (min-height 56px).
*   **Secondary/Ghost:** Use `outline` text with no background. Upon hover, transition the background to `surface-container-high`.
*   **Interaction:** Use a 300ms ease-out transition for all hover states.

### Media Cards (The Portfolio Grid)
*   **No Dividers:** Forbid the use of lines between items. Use the spacing scale (e.g., 32px or 48px) to let the media define the grid.
*   **Full-Bleed Imagery:** Images and videos should feel like they are part of the page, not trapped in a box. Use `roundedness-lg` (0.5rem) for a subtle, professional softness.
*   **Hover State:** On hover, the image should slightly scale (1.05x) within its container, and a `surface-variant` glassmorphic overlay should reveal the project title.

### Input Fields
*   **Style:** Minimalist. Use a `surface-container-lowest` background with only a bottom-weighted `outline-variant` (2px).
*   **Focus State:** The bottom line transitions to `primary`. Labels should float using the `label-sm` scale.

### Navigation (The Curator Bar)
*   **Placement:** Use an asymmetrical top-nav or a floating bottom-dock.
*   **Blur:** Apply `backdrop-blur: 12px` to ensure legibility over high-resolution media.

## 6. Do's and Don'ts

### Do:
*   **Embrace Negative Space:** If you think there is enough whitespace, add 20% more. High-end design requires "breathing room."
*   **Intentional Asymmetry:** Align some text to the left and some elements to the right to create a dynamic visual flow.
*   **High-Resolution Focus:** Ensure all containers for media maintain aspect ratios that honor the original content (e.g., 16:9 for video, 3:2 for photography).

### Don't:
*   **Don't use pure black:** Use the `surface` token (#10131b) for shadows and backgrounds to keep the design feeling "expensive."
*   **Don't use standard icons:** Use thin-stroke (1px or 1.5px) custom icons to match the weight of the `label-sm` typography.
*   **Don't use harsh transitions:** Avoid "snap" hover states. Everything in this system should feel fluid, like a camera lens focusing.