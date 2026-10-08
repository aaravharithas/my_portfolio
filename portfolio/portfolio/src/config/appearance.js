// One catalog drives the settings UI, preference validation, and provider updates.
export const appearanceCategories = [
  {
    key: 'colorMode', label: 'Day / night', description: 'Set the mood.',
    options: [
      { value: 'light', label: 'Day', description: 'Bright & airy', icon: 'sun' },
      { value: 'dark', label: 'Night', description: 'Deep & atmospheric', icon: 'moon' },
    ],
  },
  {
    key: 'designTheme', label: 'Design style', description: 'A different feel, down to the details.',
    options: [
      { value: 'glass', label: 'Glass', description: 'Clear & minimal', preview: 'glass' },
      { value: 'clay', label: 'Clay', description: 'Soft & sculpted', preview: 'clay' },
      { value: 'neumorphism', label: 'Neumorphism', description: 'Raised & recessed', preview: 'neumorphism' },
    ],
  },
  {
    key: 'effects', label: 'Motion', description: 'Choose your pace.',
    options: [
      { value: 'full', label: 'Subtle', description: 'A little movement', icon: 'sparkles' },
      { value: 'reduced', label: 'Still', description: 'Keep things calm', icon: 'still' },
    ],
  },
];

export function isValidPreference(key, value) {
  return appearanceCategories.some((category) => category.key === key && category.options.some((option) => option.value === value));
}
