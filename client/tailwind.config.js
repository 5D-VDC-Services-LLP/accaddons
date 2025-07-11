/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        fadeInUp: 'fadeInUp 1s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          // Changed 0% to start slightly below and fade in,
          // but the 100% now only controls opacity, allowing
          // the utility classes (translate-x, translate-y)
          // to dictate the final position.
          '0%': { opacity: 0, transform: 'translateY(-20px)' }, // Start slightly lower for a subtle "up" effect
          '100%': { opacity: 1, transform: 'translateY(0)'}, // Ensure it ends at its natural position relative to other transforms
        }
      }
    },
  },
  plugins: [],
}
