module.exports = {
  printWidth: 120,
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  arrowParens: 'avoid',
  overrides: [
    {
      files: ['*.yml', '*.yaml', '*.json'],
      options: {
        tabWidth: 2
      }
    }
  ],
  trailingComma: 'none'
};
